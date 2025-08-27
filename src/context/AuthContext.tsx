
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
  updateUserProfile: (userData: Partial<User>) => void;
  setUserType: (type: UserType) => void;
  selectedUserType: UserType | null;
  setTechnicianType: (type: ServiceType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Create user object from Supabase user
          const userType = session.user.user_metadata?.userType as UserType || null;
          const appUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || '',
            phone: session.user.phone || '',
            type: userType,
            serviceType: session.user.user_metadata?.serviceType as ServiceType,
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userType = session.user.user_metadata?.userType as UserType || null;
        const appUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          phone: session.user.phone || '',
          type: userType,
          serviceType: session.user.user_metadata?.serviceType as ServiceType,
        };
        setUser(appUser);
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
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update user metadata in Supabase
      supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          userType: updatedUser.type,
          serviceType: updatedUser.serviceType,
        }
      });
    }
  };

  const setUserType = (type: UserType) => {
    setSelectedUserType(type);
  };

  const setTechnicianType = (type: ServiceType) => {
    if (user && user.type === 'technician') {
      updateUserProfile({ serviceType: type });
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
