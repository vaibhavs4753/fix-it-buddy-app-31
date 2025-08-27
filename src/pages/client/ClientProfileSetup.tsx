
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

const ClientProfileSetup = () => {
  const { updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const ageNumber = age ? parseInt(age, 10) : undefined;
      
      // Update user profile
      updateUserProfile({
        name: name.trim(),
        age: ageNumber,
        profileImage: profileImage || undefined,
        personalId: Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been set up successfully",
      });
      
      // Redirect to home page
      navigate('/client/home');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg slide-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set Up Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Tell us a bit about yourself
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile Preview" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={40} className="text-gray-400" />
                </div>
              )}
              
              <label 
                htmlFor="profile-image" 
                className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input 
                id="profile-image" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-sm text-gray-500">Add a profile picture</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="age" className="block text-sm font-medium">
                Age (optional)
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full mt-1"
                min="18"
                max="120"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClientProfileSetup;
