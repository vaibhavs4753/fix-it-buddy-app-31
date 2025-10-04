import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';
import electricianBg from '@/assets/electrician-outline-bg.png';
import plumberBg from '@/assets/plumber-outline-bg.png';
import mechanicBg from '@/assets/mechanic-outline-bg.png';

interface AuthProps {
  userType: UserType;
}

const Auth = ({ userType }: AuthProps) => {
  const { signUp, signIn, verifyOtp, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  });
  const [registrationData, setRegistrationData] = useState<{name: string; age: number; userType: string} | null>(null);

  // Check for registration data from previous page
  useEffect(() => {
    const savedData = sessionStorage.getItem('registrationData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setRegistrationData(data);
      setIsSignUp(true); // User is signing up
    }
  }, []);

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return; // Prevent multiple submissions
    
    // Validate email
    const email = formData.email.trim();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = isSignUp 
        ? await signUp(email, userType)
        : await signIn(email);
      
      if (result.error) {
        let errorTitle = "Error";
        let errorDescription = result.error.message || "Something went wrong";
        
        // Handle specific error cases
        if (result.error.message?.includes('User not found')) {
          errorTitle = "Account Not Found";
          errorDescription = "No account found with this email. Please sign up first.";
        } else if (result.error.message?.includes('Invalid email')) {
          errorTitle = "Invalid Email";
          errorDescription = "Please enter a valid email address";
        } else if (result.error.message?.includes('rate limit')) {
          errorTitle = "Too Many Requests";
          errorDescription = "Please wait a moment before requesting another OTP.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code",
        });
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    if (!formData.otp || formData.otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await verifyOtp(formData.email, formData.otp);
      
      if (result.error) {
        let errorTitle = "Verification Failed";
        let errorDescription = result.error.message || "Invalid or expired OTP";
        
        if (result.error.message?.includes('expired')) {
          errorTitle = "OTP Expired";
          errorDescription = "The OTP has expired. Please request a new one.";
        } else if (result.error.message?.includes('invalid')) {
          errorTitle = "Invalid OTP";
          errorDescription = "The code you entered is incorrect. Please try again.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
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

  const handleChangePhone = () => {
    setOtpSent(false);
    setFormData({ ...formData, otp: '' });
  };

  const handleResendOtp = async () => {
    setFormData({ ...formData, otp: '' });
    await handleSendOtp({ preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Background outline images */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src={electricianBg} 
          alt="" 
          className="absolute top-10 -left-20 w-96 h-96 opacity-5 rotate-12"
        />
        <img 
          src={plumberBg} 
          alt="" 
          className="absolute bottom-10 -right-20 w-96 h-96 opacity-5 -rotate-12"
        />
        <img 
          src={mechanicBg} 
          alt="" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03]"
        />
      </div>
      
      <div className="max-w-md w-full space-y-8 p-8 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">EFIX</h1>
          <h2 className="text-xl font-medium text-white">
            {otpSent ? 'Enter Verification Code' : (isSignUp ? 'Create Account' : 'Welcome Back')}
          </h2>
          <p className="mt-2 text-neutral-400">
            {otpSent 
              ? `We sent a 6-digit code to ${formData.email}`
              : (isSignUp 
                ? `Sign up as a ${userType}` 
                : `Sign in to your ${userType} account`
              )
            }
          </p>
        </div>

        {!otpSent ? (
          // Phone Number Input Form
          <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
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
              <p className="mt-1 text-xs text-neutral-500">
                We'll send a verification code to this email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          // OTP Verification Form
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-white mb-1">
                Verification Code
              </label>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                placeholder="Enter 6-digit code"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="mt-1 text-xs text-neutral-500">
                Check your email inbox and spam folder
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleChangePhone}
                className="flex-1"
                disabled={isLoading}
              >
                Change Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                className="flex-1"
                disabled={isLoading}
              >
                Resend OTP
              </Button>
            </div>
          </form>
        )}

        {!otpSent && (
          <div className="text-center space-y-2">
            {!registrationData && (
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
            
            <div>
              <button 
                onClick={() => navigate('/')} 
                className="text-muted-foreground hover:underline text-sm hover:text-foreground"
              >
                Back to user selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
