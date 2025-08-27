import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OtpInput from '@/components/OtpInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PhoneVerification = () => {
  const { login, verifyOtp, selectedUserType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Set up a timer for OTP expiration (2 minutes)
  const [timer, setTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer <= 0 && timerActive) {
      setTimerActive(false);
      toast({
        title: "OTP Expired",
        description: "Your verification code has expired. Please request a new one.",
        variant: "destructive",
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, timerActive, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(phone);
      setOtpSent(true);
      setTimer(120);
      setTimerActive(true);
      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      console.log('Verifying OTP:', otp);
      const success = await verifyOtp(otp);
      if (success) {
        toast({
          title: "Verification Successful",
          description: "Your phone number has been verified",
        });
        
        // Redirect based on user type
        if (selectedUserType === 'client') {
          navigate('/client/profile-setup');
        } else if (selectedUserType === 'technician') {
          navigate('/technician/service-selection');
        }
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg slide-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Phone Verification</h1>
          <p className="mt-2 text-gray-600">
            {otpSent
              ? "Enter the 6-digit code sent to your phone"
              : "Enter your phone number to continue"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSendOtp} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <OtpInput 
                onComplete={handleOtpChange} 
                onChange={handleOtpChange} 
                value={otp} 
              />
              
              {timerActive && (
                <p className="text-center text-gray-500">
                  Code expires in {formatTime(timer)}
                </p>
              )}
              
              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                disabled={verifying || otp.length !== 6}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </Button>
              
              <div className="flex justify-between text-sm pt-2">
                <button 
                  onClick={() => setOtpSent(false)} 
                  className="text-primary hover:underline"
                >
                  Change phone number
                </button>
                
                <button 
                  onClick={handleSendOtp}
                  className="text-primary hover:underline"
                  disabled={isLoading || (timerActive && timer > 90)}
                >
                  {isLoading ? "Sending..." : "Resend code"}
                </button>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <button 
              onClick={() => navigate('/')} 
              className="text-gray-500 hover:underline text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;
