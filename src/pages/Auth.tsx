import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';

interface AuthProps {
  userType: UserType;
}

const Auth = ({ userType }: AuthProps) => {
  const { signUp, signIn, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'client') {
        navigate('/client/home');
      } else if (user.type === 'technician') {
        navigate('/technician/home');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = isSignUp 
        ? await signUp(formData.email, formData.password, userType)
        : await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } else if (isSignUp) {
        toast({
          title: "Sign up successful",
          description: "Please check your email for verification",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully",
        });
        
        // Redirect based on user type
        if (userType === 'client') {
          navigate('/client/profile-setup');
        } else {
          navigate('/technician/service-selection');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isSignUp 
              ? `Sign up as a ${userType}` 
              : `Sign in to your ${userType} account`
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading 
              ? (isSignUp ? "Creating Account..." : "Signing In...") 
              : (isSignUp ? "Create Account" : "Sign In")
            }
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline text-sm"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"
            }
          </button>
          
          <div>
            <button 
              onClick={() => navigate('/')} 
              className="text-gray-500 hover:underline text-sm"
            >
              Back to user selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;