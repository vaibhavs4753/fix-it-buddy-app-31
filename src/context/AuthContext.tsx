
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType, ServiceType } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  updateUserProfile: (userData: Partial<User>) => void;
  logout: () => void;
  setUserType: (type: UserType) => void;
  selectedUserType: UserType | null;
  setTechnicianType: (type: ServiceType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  
  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string) => {
    console.log('Sending OTP to:', phone);
    // In a real app, this would call an API to send OTP
    // Here we're simulating the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    console.log('Verifying OTP:', otp);
    // In a real app, this would validate the OTP via API
    // Here we're accepting any OTP as valid (for demo)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (selectedUserType && otp) {
      // Create a mock user
      const mockUser: User = {
        id: Date.now().toString(),
        name: '',
        phone: '',
        type: selectedUserType,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
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
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOtp,
        updateUserProfile,
        logout,
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
