import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useService } from '@/context/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import { ServiceType } from '@/types';
import MediaUpload from '@/components/MediaUpload';
import TrackingMap from '@/components/TrackingMap';
import TechnicianSearchProgress from '@/components/TechnicianSearchProgress';
import Footer from '@/components/Footer';

const ServiceBooking = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createServiceRequest, setCurrentRequest, autoAssignTechnician } = useService();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isVisitRequired, setIsVisitRequired] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'location' | 'searching'>('details');
  const [searchError, setSearchError] = useState<string>('');
  
  const handleMediaUpload = (files: File[], type: 'image' | 'video' | 'audio') => {
    setMediaFiles(files);
    setMediaType(type);
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    
    // Reverse geocoding simulation (in real app, use Google Maps Geocoding API)
    const simulatedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} (GPS Location)`;
    setAddress(simulatedAddress);
    
    toast({
      title: "Location Updated",
      description: "GPS location has been updated",
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation || !address.trim()) {
      toast({
        title: "Location required",
        description: "Please select a location and enter your address",
        variant: "destructive",
      });
      return;
    }
    
    handleSubmit();
  };
  
  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the issue you need help with",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedLocation || !address.trim()) {
      toast({
        title: "Location required",
        description: "Please select your service location",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSearchError('');
    
    try {
      const mediaUrls = mediaFiles.length > 0 
        ? mediaFiles.map(() => `https://example.com/media/${Math.random().toString(36).substring(2, 15)}`) 
        : [];
      
      const serviceRequest = await createServiceRequest({
        clientId: user?.id || '',
        serviceType: serviceType as ServiceType,
        description,
        mediaUrls,
        mediaType,
        location: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address,
        },
        isVisitRequired,
      });
      
      setCurrentRequest(serviceRequest);
      setStep('searching');
      
      // Use real auto-assignment with service type filtering
      const assigned = await autoAssignTechnician(
        serviceRequest.id,
        selectedLocation.lat,
        selectedLocation.lng
      );
      
      if (assigned) {
        toast({
          title: "Technician Assigned!",
          description: "A technician has been found and is on the way.",
        });
        setTimeout(() => {
          navigate('/client/tracking');
        }, 2000);
      } else {
        setSearchError("No technicians available in your area right now. Please try again later.");
      }
      
    } catch (error) {
      setSearchError("Failed to create service request. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create service request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formattedServiceType = serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1);
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => step === 'location' ? setStep('details') : navigate('/client/services')}
            className="flex items-center text-primary hover:underline mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {step === 'location' ? 'Back to details' : 'Back to services'}
          </button>
          
          <h1 className="text-2xl font-bold mb-6">
            {step === 'details' 
              ? `Book a ${formattedServiceType} Service` 
              : step === 'location' 
                ? 'Select Service Location'
                : `Finding ${formattedServiceType} Technician`
            }
          </h1>

          {step === 'details' && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep('location'); }}>
              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  Describe your issue
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the problem you're experiencing..."
                  className="mt-1"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Add photos, videos, or audio description
                </Label>
                <MediaUpload onMediaUpload={handleMediaUpload} />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="visit"
                  checked={isVisitRequired}
                  onCheckedChange={setIsVisitRequired}
                />
                <Label htmlFor="visit" className="cursor-pointer">
                  Request an in-person visit
                </Label>
              </div>
              
              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={!description.trim()}
              >
                Continue to Location Selection
              </Button>
            </form>
          )}

          {step === 'searching' && (
            <div className="space-y-6">
              <TechnicianSearchProgress
                isSearching={isLoading}
                serviceType={serviceType as ServiceType}
                location={selectedLocation ? {
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                  address: address
                } : undefined}
                searchError={searchError}
                onAutoAssign={() => {
                  setStep('location');
                  setSearchError('');
                }}
              />
              
              {searchError && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStep('location');
                      setSearchError('');
                    }}
                    className="mt-4"
                  >
                    Back to Location Selection
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 'location' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  Service Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter your address or use GPS location"
                  className="mt-1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enable GPS for automatic location detection
                </p>
              </div>

              <div>
                <Label className="text-base font-medium mb-2 block">
                  GPS Tracking Map
                </Label>
                <div 
                  className="cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const lat = 40.7128 + (y - rect.height / 2) * 0.001;
                    const lng = -74.006 + (x - rect.width / 2) * 0.001;
                    handleLocationSelect(lat, lng);
                    setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Selected on map)`);
                  }}
                >
                  <TrackingMap 
                    clientLocation={{
                      lat: selectedLocation?.lat || 40.7128,
                      lng: selectedLocation?.lng || -74.006,
                      address: address || 'Your location'
                    }}
                    onLocationUpdate={handleLocationUpdate}
                    className="h-80 border-2 border-dashed border-gray-300 hover:border-primary"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click "Enable GPS" for automatic location or click on the map to select manually
                </p>
              </div>

              {selectedLocation && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Location Confirmed</h3>
                  <p className="text-sm text-green-700">
                    Latitude: {selectedLocation.lat.toFixed(6)}<br/>
                    Longitude: {selectedLocation.lng.toFixed(6)}<br/>
                    Address: {address}
                  </p>
                </div>
              )}

              <Button
                onClick={handleConfirmLocation}
                className="w-full py-6 text-lg"
                disabled={!selectedLocation || !address.trim() || isLoading}
              >
                {isLoading ? "Finding & Assigning Technician..." : "Book Service Now"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ServiceBooking;
