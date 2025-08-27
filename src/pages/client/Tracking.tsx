
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useService } from '@/context/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import TrackingMap from '@/components/TrackingMap';
import Footer from '@/components/Footer';

const Tracking = () => {
  const { currentRequest, cancelServiceRequest, nearby } = useService();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignedTechnician, setAssignedTechnician] = useState<{
    id: string;
    name: string;
    rating: number;
    distance: string;
    estimatedTime: string;
    profileImage?: string;
    currentLocation: { lat: number; lng: number };
  } | null>(null);
  
  const [status, setStatus] = useState<'searching' | 'found' | 'on_way' | 'arrived'>('searching');
  const [timeRemaining, setTimeRemaining] = useState<number>(3);
  const [clientGPSLocation, setClientGPSLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!currentRequest) {
      navigate('/client/home');
      return;
    }
    
    // Simulate finding a technician after 5 seconds
    const searchTimer = setTimeout(() => {
      setStatus('found');
      setAssignedTechnician({
        id: 'tech-' + Math.random().toString(36).substring(2, 10),
        name: 'Rahul Sharma',
        rating: 4.8,
        distance: '1.5 km away',
        estimatedTime: '15 mins',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        currentLocation: { lat: 40.7150, lng: -74.002 }
      });
    }, 5000);
    
    return () => clearTimeout(searchTimer);
  }, [currentRequest, navigate]);
  
  useEffect(() => {
    if (status === 'found') {
      const onWayTimer = setTimeout(() => {
        setStatus('on_way');
      }, 3000);
      
      return () => clearTimeout(onWayTimer);
    }
    
    if (status === 'on_way') {
      // Progress tracking
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 100));
      }, 1000);
      
      const arrivalInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setStatus('arrived');
            return 0;
          }
          return prev - 1;
        });
      }, 60000);
      
      const arrivalTimer = setTimeout(() => {
        setStatus('arrived');
        setTimeRemaining(0);
        setProgress(100);
      }, 9000);
      
      return () => {
        clearInterval(progressInterval);
        clearInterval(arrivalInterval);
        clearTimeout(arrivalTimer);
      };
    }
  }, [status]);
  
  useEffect(() => {
    if (status === 'on_way' && assignedTechnician && currentRequest) {
      const moveInterval = setInterval(() => {
        setAssignedTechnician(prev => {
          if (!prev || !currentRequest) return prev;
          
          const clientLat = clientGPSLocation?.lat || currentRequest.location.lat;
          const clientLng = clientGPSLocation?.lng || currentRequest.location.lng;
          const moveSpeed = 0.0002; // Faster movement for better visual feedback
          
          const newLat = prev.currentLocation.lat + (clientLat - prev.currentLocation.lat) * moveSpeed;
          const newLng = prev.currentLocation.lng + (clientLng - prev.currentLocation.lng) * moveSpeed;
          
          return {
            ...prev,
            currentLocation: { lat: newLat, lng: newLng }
          };
        });
      }, 1000); // More frequent updates
      
      return () => clearInterval(moveInterval);
    }
  }, [status, assignedTechnician, currentRequest, clientGPSLocation]);

  const handleLocationUpdate = (lat: number, lng: number, accuracy?: number, bearing?: number) => {
    setClientGPSLocation({ lat, lng });
    if (accuracy && accuracy < 20) {
      toast({
        title: "High Accuracy GPS",
        description: `Location accurate to ±${Math.round(accuracy)}m`,
      });
    }
  };
  
  const handleCancel = async () => {
    try {
      if (currentRequest) {
        await cancelServiceRequest(currentRequest.id);
        toast({
          title: "Service Cancelled",
          description: "Your service request has been cancelled",
        });
        navigate('/client/home');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel service. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleChangeLocation = () => {
    toast({
      title: "Location Updated",
      description: "Your service location has been updated",
    });
  };
  
  if (!currentRequest) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header with Status */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {status === 'searching' && 'Finding Your Technician'}
              {status === 'found' && 'Technician Found!'}
              {status === 'on_way' && 'Technician En Route'}
              {status === 'arrived' && 'Technician Has Arrived!'}
            </h1>
            
            {/* Status Progress Bar */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    status === 'searching' ? 'bg-yellow-500 w-1/4' :
                    status === 'found' ? 'bg-blue-500 w-1/2' :
                    status === 'on_way' ? 'bg-orange-500 w-3/4' :
                    'bg-green-500 w-full'
                  }`}
                  style={{ width: status === 'on_way' ? `${Math.max(50, progress)}%` : undefined }}
                ></div>
              </div>
              <Badge 
                variant={
                  status === 'searching' ? 'secondary' :
                  status === 'found' ? 'default' :
                  status === 'on_way' ? 'destructive' :
                  'default'
                }
                className="text-sm px-3 py-1"
              >
                {status === 'searching' && 'Searching...'}
                {status === 'found' && 'Found'}
                {status === 'on_way' && `${timeRemaining} min${timeRemaining !== 1 ? 's' : ''} away`}
                {status === 'arrived' && 'Arrived'}
              </Badge>
            </div>
          </div>
          
          {/* Enhanced GPS Tracking Map */}
          <Card className="mb-6 overflow-hidden shadow-xl">
            <CardContent className="p-0">
              <TrackingMap 
                clientLocation={{
                  lat: clientGPSLocation?.lat || currentRequest.location.lat,
                  lng: clientGPSLocation?.lng || currentRequest.location.lng,
                  address: currentRequest.location.address
                }}
                technicianLocation={assignedTechnician ? {
                  lat: assignedTechnician.currentLocation.lat,
                  lng: assignedTechnician.currentLocation.lng,
                  name: assignedTechnician.name
                } : undefined}
                showRoute={status !== 'searching'}
                onLocationUpdate={handleLocationUpdate}
                className="h-96"
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status and Information */}
            <div className="lg:col-span-2 space-y-6">
              {status === 'searching' && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-yellow-800">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-600 mr-3"></div>
                      Finding Your {currentRequest.serviceType.charAt(0).toUpperCase() + currentRequest.serviceType.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-700 mb-4">We're searching for qualified technicians in your area...</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {nearby.map((tech, i) => (
                        <div key={i} className="bg-white/60 p-4 rounded-lg text-center">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-yellow-700 text-sm font-bold">{i + 1}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{tech.distance} km</p>
                          <p className="text-xs text-gray-600">away</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {status !== 'searching' && assignedTechnician && (
                <Card className={`${
                  status === 'found' ? 'border-blue-200 bg-blue-50' :
                  status === 'on_way' ? 'border-orange-200 bg-orange-50' :
                  'border-green-200 bg-green-50'
                } shadow-lg`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center ${
                      status === 'found' ? 'text-blue-800' :
                      status === 'on_way' ? 'text-orange-800' :
                      'text-green-800'
                    }`}>
                      <div className="mr-4">
                        {assignedTechnician.profileImage ? (
                          <img 
                            src={assignedTechnician.profileImage} 
                            alt="Technician" 
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-bold">{assignedTechnician.name}</h2>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold">{assignedTechnician.rating}</span>
                          </div>
                          <span className="ml-4 text-sm">
                            {status === 'on_way' && `Arriving in ${timeRemaining} min${timeRemaining !== 1 ? 's' : ''}`}
                            {status === 'arrived' && 'Has arrived at your location'}
                            {status === 'found' && assignedTechnician.distance}
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`${
                    status === 'found' ? 'text-blue-700' :
                    status === 'on_way' ? 'text-orange-700' :
                    'text-green-700'
                  }`}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="block text-sm font-medium opacity-75">Service Type:</span>
                        <span className="text-lg font-semibold capitalize">{currentRequest.serviceType}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium opacity-75">Visit Required:</span>
                        <span className="text-lg font-semibold">{currentRequest.isVisitRequired ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="block text-sm font-medium opacity-75 mb-1">Service Location:</span>
                      <span className="text-sm">
                        {clientGPSLocation ? 'GPS Tracked Location' : currentRequest.location.address}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => {
                          toast({
                            title: "Calling...",
                            description: `Would call ${assignedTechnician.name} in a real app`,
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => {
                          toast({
                            title: "Messaging...",
                            description: `Would open chat with ${assignedTechnician.name} in a real app`,
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Action Cards */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full justify-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Service
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleChangeLocation}
                    className="w-full justify-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Update Location
                  </Button>
                </CardContent>
              </Card>
              
              {/* Service Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Issue:</span>
                    <p className="text-gray-600 mt-1">{currentRequest.description}</p>
                  </div>
                  {currentRequest.mediaUrls.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Media Attached:</span>
                      <p className="text-gray-600 mt-1">{currentRequest.mediaUrls.length} file(s)</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Tracking;
