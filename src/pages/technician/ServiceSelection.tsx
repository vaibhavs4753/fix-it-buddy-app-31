
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ServiceType } from '@/types';
import ServiceTypeCard from '@/components/ServiceTypeCard';
import { useToast } from '@/hooks/use-toast';

const ServiceSelection = () => {
  const { setTechnicianType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleServiceSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
  };
  
  const handleContinue = () => {
    if (!selectedService) {
      toast({
        title: "Selection Required",
        description: "Please select a service category to continue",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      setTechnicianType(selectedService);
      
      toast({
        title: "Service Selected",
        description: `You've selected ${selectedService} as your service category`,
      });
      
      // Redirect to profile setup
      navigate('/technician/profile-setup');
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
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-lg w-full space-y-8 p-8 bg-white rounded-xl shadow-lg slide-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Select Your Service</h1>
          <p className="mt-2 text-gray-600">
            What type of service do you provide?
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="grid gap-4">
            <ServiceTypeCard 
              serviceType="electrician"
              onClick={() => handleServiceSelect('electrician')}
              className={`cursor-pointer transform transition-all ${selectedService === 'electrician' ? 'scale-105 ring-2 ring-primary' : 'hover:scale-102'}`}
            />
            
            <ServiceTypeCard 
              serviceType="mechanic"
              onClick={() => handleServiceSelect('mechanic')}
              className={`cursor-pointer transform transition-all ${selectedService === 'mechanic' ? 'scale-105 ring-2 ring-primary' : 'hover:scale-102'}`}
            />
            
            <ServiceTypeCard 
              serviceType="plumber"
              onClick={() => handleServiceSelect('plumber')}
              className={`cursor-pointer transform transition-all ${selectedService === 'plumber' ? 'scale-105 ring-2 ring-primary' : 'hover:scale-102'}`}
            />
          </div>
          
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
              selectedService 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
