
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  userType: UserType;
  allowIfProfileIncomplete?: boolean;
}

const ProtectedRoute = ({ children, userType, allowIfProfileIncomplete = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading or redirect to login if not authenticated
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user type matches the required type
  if (user?.type !== userType) {
    if (userType === 'client') {
      return <Navigate to="/technician/home" replace />;
    } else {
      return <Navigate to="/client/home" replace />;
    }
  }
  
  // For client: Check if profile is complete (has a name)
  if (userType === 'client' && !allowIfProfileIncomplete && !user?.name) {
    return <Navigate to="/client/profile-setup" replace />;
  }
  
  // For technician: Check if service type and profile are complete
  if (userType === 'technician' && !allowIfProfileIncomplete) {
    if (!user?.serviceType) {
      return <Navigate to="/technician/service-selection" replace />;
    }
    
    if (!user?.name) {
      return <Navigate to="/technician/profile-setup" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
