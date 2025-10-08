import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';

interface AuthPageProps {
  userType: UserType;
}

const AuthPage = ({ userType }: AuthPageProps) => {
  const { signUp, signIn, resetPassword, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
  });

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      if (user.type === 'client') {
        navigate('/client/home');
      } else if (user.type === 'technician') {
        navigate('/technician/home');
      } else {
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
    
    if (isLoading) return;

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        toast({
          title: "Weak password",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }

      if (password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords match",
          variant: "destructive",
        });
        return;
      }

      if (!formData.name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your name",
          variant: "destructive",
        });
        return;
      }

      const ageNum = parseInt(formData.age);
      if (!formData.age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        toast({
          title: "Invalid age",
          description: "Please enter a valid age (13-120)",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const { error } = await signUp(email, password, formData.name.trim(), ageNum, userType);

        if (error) {
          if (error.message.includes('already') || error.message.includes('exists')) {
            toast({
              title: "Account already exists",
              description: "This email is already registered. Try logging in or click forget password if you've forgotten it.",
              variant: "destructive",
            });
            // Switch to sign-in mode after showing the message
            setTimeout(() => {
              setIsSignUp(false);
              setFormData({
                ...formData,
                password: '',
                confirmPassword: '',
                name: '',
                age: '',
              });
            }, 2000);
          } else {
            toast({
              title: "Sign up failed",
              description: error.message || "Unable to create account",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created successfully!",
            description: "Redirecting you to the login page...",
          });
          // Redirect to login page after successful registration
          setTimeout(() => {
            setIsSignUp(false);
            setFormData({
              email: formData.email,
              password: '',
              confirmPassword: '',
              name: '',
              age: '',
            });
          }, 1500);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);

      try {
        const { error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message || "Invalid email or password",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
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
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-neutral-400">
            {isSignUp ? `Sign up as a ${userType}` : `Sign in as a ${userType}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-white mb-1">
                  Age
                </label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="13"
                  max="120"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </>
          )}

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
              className="w-full bg-neutral-800 border-neutral-700 text-white"
              autoFocus={!isSignUp}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
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
                className="w-full bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
          >
            {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          {!isSignUp && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={async () => {
                  if (!formData.email) {
                    toast({
                      title: "Email required",
                      description: "Please enter your email address first",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  const { error } = await resetPassword(formData.email);
                  if (error) {
                    toast({
                      title: "Error",
                      description: error.message,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Check your email",
                      description: "If an account exists, a password reset link has been sent.",
                    });
                  }
                }}
                className="text-sm text-neutral-400 hover:text-primary"
              >
                Forgot password?
              </button>
            </div>
          )}
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                age: '',
              });
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-neutral-400 hover:text-white text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
