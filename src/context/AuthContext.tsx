import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserType, ServiceType } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (phone: string, userType: UserType) => Promise<{ error: any }>;
  signIn: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ data: any, error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  setUserType: (type: UserType) => void;
  selectedUserType: UserType | null;
  setTechnicianType: (type: ServiceType) => void;
  switchRole: (newRole: UserType) => Promise<void>;
  addRole: (newRole: UserType) => Promise<void>;
  availableRoles: UserType[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserType[]>([]);
  
  useEffect(() => {
    let isMounted = true;
    
    // Map database roles to app UserType
    const mapRoleToUserType = (role: string): UserType => {
      return role === 'customer' ? 'client' : role as UserType;
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        if (session?.user) {
          try {
            // Fetch user profile from profiles table
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profile && !profileError) {
              // Get technician service type if user is a technician
              let serviceType: ServiceType | undefined = undefined;
              if (profile.active_role === 'technician') {
                const { data: techProfile } = await supabase
                  .from('technician_profiles')
                  .select('service_type')
                  .eq('user_id', session.user.id)
                  .maybeSingle();
                serviceType = techProfile?.service_type as ServiceType;
              }

              const appUser: User = {
                id: session.user.id,
                name: profile.name || session.user.email || '',
                phone: profile.phone || '',
                type: mapRoleToUserType(profile.active_role || profile.role),
                serviceType,
              };
              setUser(appUser);
              setAvailableRoles((profile.available_roles || ['customer']).map(mapRoleToUserType));
            } else {
              // Fallback to metadata if profile doesn't exist or there's an error
              console.warn('Profile not found or error occurred, using fallback from user_metadata', profileError);
              const userType = session.user.user_metadata?.userType as UserType || 'client';
              const appUser: User = {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email || '',
                phone: session.user.phone || '',
                type: userType,
                serviceType: session.user.user_metadata?.serviceType as ServiceType,
              };
              setUser(appUser);
              setAvailableRoles([userType]);
            }
          } catch (error) {
            console.error('Error fetching profile (database may not be set up):', error);
            // Fallback to metadata - this ensures auth works even without database tables
            const userType = session.user.user_metadata?.userType as UserType || 'client';
            const appUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email || '',
              phone: session.user.phone || '',
              type: userType,
              serviceType: session.user.user_metadata?.serviceType as ServiceType,
            };
            setUser(appUser);
            setAvailableRoles([userType]);
          }
        } else {
          setUser(null);
          setAvailableRoles([]);
        }
        setIsLoading(false);
      }
    );

    // Get initial session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && !session) {
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (phone: string, userType: UserType) => {
    // Send OTP to phone number for sign up
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
        data: {
          userType: userType
        }
      }
    });
    
    return { error };
  };

  const signIn = async (phone: string) => {
    // Send OTP to phone number for sign in
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: false
      }
    });
    
    return { error };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAvailableRoles([]);
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update profile in database
      await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          phone: updatedUser.phone,
        })
        .eq('id', user.id);
    }
  };

  const setUserType = (type: UserType) => {
    setSelectedUserType(type);
  };

  const setTechnicianType = (type: ServiceType) => {
    if (user) {
      setUser({ ...user, serviceType: type });
    }
  };

  const switchRole = async (newRole: UserType) => {
    if (!user || !availableRoles.includes(newRole)) return;
    
    try {
      const { error } = await (supabase as any).rpc('switch_user_role', {
        new_role: newRole
      });
      
      if (!error) {
        setUser({ ...user, type: newRole });
      }
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const addRole = async (newRole: UserType) => {
    if (!user || availableRoles.includes(newRole)) return;
    
    try {
      const { error } = await (supabase as any).rpc('add_user_role', {
        new_role: newRole
      });
      
      if (!error) {
        setAvailableRoles([...availableRoles, newRole]);
      }
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session?.user,
        isLoading,
        signUp,
        signIn,
        verifyOtp,
        signOut,
        resetPassword,
        updateUserProfile,
        setUserType,
        selectedUserType,
        setTechnicianType,
        switchRole,
        addRole,
        availableRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};