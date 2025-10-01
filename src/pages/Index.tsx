
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // This effect is for initial page load
    document.title = 'EFIX - Professional Services';
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    if (user?.type === 'client') {
      return <Navigate to="/client/home" replace />;
    } else {
      return <Navigate to="/technician/home" replace />;
    }
  }

  return <Navigate to="/" replace />;
};

export default Index;
