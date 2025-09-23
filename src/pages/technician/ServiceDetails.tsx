
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useService } from '@/context/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import MapView from '@/components/MapView';
import ServiceIcon from '@/components/ServiceIcon';
import Footer from '@/components/Footer';

const ServiceDetails = () => {
  const { currentRequest, completeServiceRequest } = useService();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [personalId, setPersonalId] = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!currentRequest) {
    navigate('/technician/home');
    return null;
  }
  
  const handleComplete = async () => {
    if (!personalId.trim()) {
      toast({
        title: "Personal ID Required",
        description: "Please enter the client's personal ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await completeServiceRequest(currentRequest.id, personalId);
      
      if (success) {
        toast({
          title: "Service Completed",
          description: "The service has been marked as completed",
        });
        navigate('/technician/home');
      } else {
        toast({
          title: "Invalid ID",
          description: "The personal ID entered is incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate('/technician/home')}
            className="flex items-center text-primary hover:underline mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </button>
          
          <h1 className="text-2xl font-bold mb-6">Service Details</h1>
          
          {/* Map View */}
          <div className="mb-6">
            <MapView 
              origin={{ lat: 40.7135, lng: -74.004 }} 
              destination={{ lat: 40.7128, lng: -74.006 }}
              className="h-64"
            />
          </div>
          
          {/* Service Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <ServiceIcon type={currentRequest.serviceType} size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-lg capitalize">{currentRequest.serviceType} Service</h2>
                <p className="text-sm text-black">{formatDate(new Date(currentRequest.createdAt))}</p>
              </div>
            </div>
            
            <div className="border-t border-black py-4">
              <h3 className="font-medium mb-2">Service Location</h3>
              <p className="text-black">{currentRequest.location.address}</p>
            </div>
            
            <div className="border-t border-black py-4">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-black">{currentRequest.description}</p>
            </div>
            
            {currentRequest.mediaUrls.length > 0 && (
              <div className="border-t border-black py-4">
                <h3 className="font-medium mb-2">Media</h3>
                <div className="flex flex-wrap gap-2">
                  {currentRequest.mediaUrls.map((url, index) => (
                    <div key={index} className="relative">
                      {currentRequest.mediaType === 'image' && (
                        <div className="w-20 h-20 bg-white rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {currentRequest.mediaType === 'video' && (
                        <div className="w-20 h-20 bg-white rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {currentRequest.mediaType === 'audio' && (
                        <div className="w-20 h-20 bg-white rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-black py-4">
              <h3 className="font-medium mb-2">Visit Required</h3>
              <p className="text-black">{currentRequest.isVisitRequired ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {/* Client Contact & Actions */}
          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // In a real app, this would open the phone app
                toast({
                  title: "Contact Client",
                  description: "Would dial client's number in a real app",
                });
              }}
              className="flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Client
            </Button>
            
            {showCompleteForm ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Complete Service</h3>
                <p className="text-sm text-black mb-4">
                  Ask the client for their personal ID to complete the service
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="personalId" className="text-sm font-medium">
                      Client's Personal ID
                    </Label>
                    <Input
                      id="personalId"
                      type="text"
                      placeholder="Enter client's personal ID"
                      value={personalId}
                      onChange={(e) => setPersonalId(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleComplete}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Processing..." : "Complete Service"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowCompleteForm(false)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowCompleteForm(true)}>
                Complete Service
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ServiceDetails;
