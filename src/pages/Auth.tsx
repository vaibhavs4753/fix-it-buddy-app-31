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
  const { signUp, signIn, resetPassword, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth redirect check:', { isAuthenticated, user, authLoading });
    
    if (isAuthenticated && user && !authLoading) {
      console.log('User authenticated, redirecting...', user);
      // Use the user's actual active role, not the userType prop
      if (user.type === 'client') {
        console.log('Redirecting to client home');
        navigate('/client/home');
      } else if (user.type === 'technician') {
        console.log('Redirecting to technician home');
        navigate('/technician/home');
      } else {
        // If no specific type is set, redirect to profile setup
        if (userType === 'client') {
          console.log('Redirecting to client profile setup');
          navigate('/client/profile-setup');
        } else {
          console.log('Redirecting to technician service selection');
          navigate('/technician/service-selection');
        }
      }
    }
  }, [isAuthenticated, user, navigate, userType, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { isSignUp, isForgotPassword, email: formData.email, userType });
    
    // Handle forgot password
    if (isForgotPassword) {
      if (!formData.email) {
        toast({
          title: "Email required",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const result = await resetPassword(formData.email);
        
        if (result.error) {
          toast({
            title: "Password Reset Error",
            description: result.error.message || "Something went wrong",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password Reset Email Sent",
            description: "Please check your email for password reset instructions",
          });
          setIsForgotPassword(false);
        }
      } catch (error) {
        console.error('Reset password error:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
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
        let errorTitle = "Authentication Error";
        let errorDescription = result.error.message || "Something went wrong";
        
        // Handle specific error cases
        if (result.error.message?.includes('Invalid login credentials')) {
          if (isSignUp) {
            errorTitle = "Sign Up Failed";
            errorDescription = "Unable to create account. Please check your details.";
          } else {
            errorTitle = "Sign In Failed";
            errorDescription = "Invalid email or password. Please check your credentials.";
          }
        } else if (result.error.message?.includes('User not found')) {
          errorTitle = "Account Not Found";
          errorDescription = "No account found with this email. Please create an account first.";
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorTitle = "Email Not Verified";
          errorDescription = "Please check your email and click the verification link before signing in.";
        } else if (result.error.message?.includes('User already registered')) {
          errorTitle = "Account Already Exists";
          errorDescription = "An account with this email already exists. Please sign in instead.";
        } else if (result.error.message?.includes('Password')) {
          errorTitle = "Password Error";
          errorDescription = "Please check your password and try again.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
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
            {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}
          </h1>
          <p className="mt-2 text-gray-600">
            {isForgotPassword 
              ? "Enter your email to receive password reset instructions"
              : (isSignUp 
                ? `Sign up as a ${userType}` 
                : `Sign in to your ${userType} account`
              )
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

          {!isForgotPassword && (
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
          )}

          {isSignUp && !isForgotPassword && (
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
              ? (isForgotPassword ? "Sending Reset Email..." : (isSignUp ? "Creating Account..." : "Signing In..."))
              : (isForgotPassword ? "Send Reset Email" : (isSignUp ? "Create Account" : "Sign In"))
            }
          </Button>
        </form>

        <div className="text-center space-y-2">
          {!isForgotPassword && (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline text-sm"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"
              }
            </button>
          )}
          
          {!isSignUp && !isForgotPassword && (
            <div>
              <button
                onClick={() => setIsForgotPassword(true)}
                className="text-primary hover:underline text-sm"
              >
                Forgot your password?
              </button>
            </div>
          )}
          
          {isForgotPassword && (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-primary hover:underline text-sm"
            >
              Back to sign in
            </button>
          )}
          
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