import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType, ServiceType } from '../types';

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, age: number, userType: UserType) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
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

const API_BASE = 'http://localhost:3000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserType[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  
  // Map database roles to app UserType
  const mapRoleToUserType = (role: string): UserType => {
    return role === 'customer' ? 'client' : role as UserType;
  };

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Get technician service type if user is a technician
          let serviceType: ServiceType | undefined = undefined;
          if (userData.role === 'technician') {
            const techResponse = await fetch(`${API_BASE}/technicians/profile/my`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (techResponse.ok) {
              const techData = await techResponse.json();
              serviceType = techData?.serviceType as ServiceType;
            }
          }

          const appUser: User = {
            id: userData.id,
            name: userData.name || userData.email,
            phone: userData.phone || '',
            type: mapRoleToUserType(userData.role),
            serviceType,
          };
          
          setUser(appUser);
          setSession({ user: appUser });
          setAvailableRoles((userData.availableRoles || ['customer']).map(mapRoleToUserType));
        } else {
          // Token invalid, clear it
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const signUp = async (email: string, password: string, name: string, age: number, userType: UserType) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          age,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Registration failed' } };
      }

      // Store token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Login failed' } };
      }

      // Store token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setSession(null);
    setAvailableRoles([]);
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Failed to send reset email' } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
        }),
      });

      if (response.ok) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        setSession({ user: updatedUser });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
    if (!user || !availableRoles.includes(newRole) || !token) return;
    
    try {
      const response = await fetch(`${API_BASE}/auth/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole }),
      });
      
      if (response.ok) {
        setUser({ ...user, type: newRole });
        if (session) {
          setSession({ user: { ...user, type: newRole } });
        }
      }
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const addRole = async (newRole: UserType) => {
    if (!user || availableRoles.includes(newRole) || !token) return;
    
    try {
      const response = await fetch(`${API_BASE}/auth/add-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole }),
      });
      
      if (response.ok) {
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
        isAuthenticated: !!user,
        isLoading,
        signUp,
        signIn,
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
