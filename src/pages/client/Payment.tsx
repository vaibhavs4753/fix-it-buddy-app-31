
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useService } from '@/context/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const Payment = () => {
  const { currentRequest } = useService();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  
  if (!currentRequest) {
    navigate('/client/services');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, we would process the payment if online payment
      // is selected, or mark the service as "pay with cash"
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Booking Confirmed!",
        description: "Your service request has been sent to nearby technicians.",
      });
      
      // Navigate to tracking page
      navigate('/client/tracking');
      
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate estimated cost based on service type
  const getEstimatedCost = () => {
    switch (currentRequest.serviceType) {
      case 'electrician':
        return '₹500 - ₹1,500';
      case 'mechanic':
        return '₹800 - ₹2,000';
      case 'plumber':
        return '₹400 - ₹1,200';
      default:
        return '₹500 - ₹1,500';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:underline mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-2xl font-bold mb-6">Payment Options</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Service Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type:</span>
                <span className="font-medium capitalize">{currentRequest.serviceType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{currentRequest.location.address}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Visit Required:</span>
                <span className="font-medium">{currentRequest.isVisitRequired ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cost:</span>
                <span className="font-medium">{getEstimatedCost()}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                * Final cost will depend on the scope of work required after diagnosis
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Select Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'online')}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cash Payment (Pay after service)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="cursor-pointer flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Online Payment
                  </Label>
                </div>
              </RadioGroup>
              
              {paymentMethod === 'online' && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    * For demo purposes, no actual payment will be processed
                  </p>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">Visa</span>
                    </div>
                    <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">Mastercard</span>
                    </div>
                    <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">PayPal</span>
                    </div>
                    <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">GPay</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;
