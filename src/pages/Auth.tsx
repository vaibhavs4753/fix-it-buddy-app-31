import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated when auth state is stable
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
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
  }, [isAuthenticated, user, authLoading, navigate, userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return; // Prevent multiple submissions
    
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
    
    try {
      const result = isSignUp 
        ? await signUp(formData.email, formData.password, userType)
        : await signIn(formData.email, formData.password);
      
      if (result.error) {
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
        toast({
          title: "Sign up successful",
          description: "Please check your email for verification",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully",
        });
        // Success - the useEffect will handle redirection
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">EFIX</h1>
          <h2 className="text-xl font-medium text-white">
            {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}
          </h2>
          <p className="mt-2 text-neutral-400">
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
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {isSignUp && !isForgotPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
              className="text-muted-foreground hover:underline text-sm hover:text-foreground"
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