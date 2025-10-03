import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';

interface RegistrationProps {
  userType: UserType;
}

const Registration = ({ userType }: RegistrationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // Store registration data in sessionStorage
    sessionStorage.setItem('registrationData', JSON.stringify({
      name: formData.name.trim(),
      age: ageNum,
      userType
    }));

    // Navigate to phone auth
    navigate(`/auth/${userType}`);
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
          <h2 className="text-xl font-medium text-white">Create Account</h2>
          <p className="mt-2 text-neutral-400">
            Sign up as a {userType}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
              className="w-full"
              autoFocus
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
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleInputChange}
              min="13"
              max="120"
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-muted-foreground hover:underline text-sm hover:text-foreground"
          >
            Back to user selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
