
import React, { useRef, useState, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  value?: string;
  className?: string;
}

const OtpInput = ({ length = 6, onComplete, onChange, value: externalValue, className }: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(externalValue ? 
    externalValue.split('').concat(Array(Math.max(0, length - externalValue.length)).fill('')) : 
    Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    // Focus the first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  useEffect(() => {
    // Update internal state if external value changes
    if (externalValue !== undefined) {
      const newOtp = externalValue.split('').concat(Array(Math.max(0, length - externalValue.length)).fill(''));
      setOtp(newOtp);
    }
  }, [externalValue, length]);
  
  // Check if OTP is complete (all digits filled)
  const isOtpComplete = (otpArray: string[]): boolean => {
    return otpArray.length === length && otpArray.every(digit => digit !== '');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    // Take the last character if more than one was somehow entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Move to next input if current input is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Update parent component with current OTP value
    const otpValue = newOtp.join('');
    if (onChange) {
      onChange(otpValue);
    }
    
    // Check if OTP is complete
    if (isOtpComplete(newOtp) && onComplete) {
      onComplete(otpValue);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      
      // Update parent component with current OTP value
      if (onChange) {
        onChange(newOtp.join(''));
      }
    }
  };
  
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pasteData)) return; // Only allow digits
    
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(length, pasteData.length); i++) {
      newOtp[i] = pasteData[i];
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = pasteData[i];
      }
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const focusIndex = Math.min(length - 1, pasteData.length);
    inputRefs.current[focusIndex]?.focus();
    
    // Update parent component
    const otpValue = newOtp.join('');
    if (onChange) {
      onChange(otpValue);
    }
    
    // Check if OTP is complete
    if (isOtpComplete(newOtp) && onComplete) {
      onComplete(otpValue);
    }
  };
  
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {[...Array(length)].map((_, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-12 h-12 text-center text-2xl border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ))}
    </div>
  );
};

export default OtpInput;
