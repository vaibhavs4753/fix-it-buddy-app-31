import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserType, ServiceType } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, userType: UserType) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            const appUser: User = {
              id: session.user.id,
              name: profile.name || session.user.email,
              phone: profile.phone || '',
              type: profile.active_role as UserType,
              serviceType: profile.role === 'technician' ? 'electrician' : undefined,
            };
            setUser(appUser);
            setAvailableRoles((profile.available_roles || ['customer']) as UserType[]);
          } else {
            // Fallback to metadata if profile doesn't exist
            const userType = session.user.user_metadata?.userType as UserType || 'client';
            const appUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email,
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

    // THEN check for existing session  
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Fetch user profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const appUser: User = {
            id: session.user.id,
            name: profile.name || session.user.email,
            phone: profile.phone || '',
            type: profile.active_role as UserType,
            serviceType: profile.role === 'technician' ? 'electrician' : undefined,
          };
          setUser(appUser);
          setAvailableRoles((profile.available_roles || ['customer']) as UserType[]);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userType: UserType) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          userType: userType
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAvailableRoles([]);
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
      const { error } = await supabase.rpc('switch_user_role', {
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
      const { error } = await supabase.rpc('add_user_role', {
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
        signOut,
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