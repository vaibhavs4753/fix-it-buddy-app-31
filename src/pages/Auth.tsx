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
      // Use the user's actual active role, not the userType prop
      if (user.type === 'client') {
        navigate('/client/home');
      } else if (user.type === 'technician') {
        navigate('/technician/home');
      } else {
        // If no specific type is set, redirect to profile setup
        if (userType === 'client') {
          navigate('/client/profile-setup');
        } else {
          navigate('/technician/service-selection');
        }
      }
    }
  }, [isAuthenticated, user, navigate, userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { isSignUp, email: formData.email, userType });
    
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
    console.log('Starting authentication...');
    
    try {
      const result = isSignUp 
        ? await signUp(formData.email, formData.password, userType)
        : await signIn(formData.email, formData.password);

      console.log('Auth result:', result);
      
      if (result.error) {
        console.error('Auth error:', result.error);
        toast({
          title: "Authentication Error",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        });
      } else if (isSignUp) {
        console.log('Sign up successful');
        toast({
          title: "Sign up successful",
          description: "Please check your email for verification",
        });
      } else {
        console.log('Sign in successful');
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully",
        });
        
        // Don't redirect immediately - let useEffect handle it based on user profile
        // The useEffect will redirect based on the actual user type from the database
      }
    } catch (error) {
      console.error('Auth catch error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('Auth process completed');
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