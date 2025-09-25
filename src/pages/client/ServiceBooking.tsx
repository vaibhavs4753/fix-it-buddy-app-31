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
  const { createServiceRequest, setCurrentRequest, autoAssignTechnician, currentRequest } = useService();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isVisitRequired, setIsVisitRequired] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'location'>('details');
  const [searchError, setSearchError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [serviceRequestCreated, setServiceRequestCreated] = useState(false);
  
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

    // Auto-start technician search when location is set
    if (!serviceRequestCreated) {
      handleCreateServiceRequest(lat, lng, simulatedAddress);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    const simulatedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} (Selected on map)`;
    setAddress(simulatedAddress);
    
    // Auto-start technician search when location is manually selected
    if (!serviceRequestCreated) {
      handleCreateServiceRequest(lat, lng, simulatedAddress);
    }
  };

  const handleCreateServiceRequest = async (lat: number, lng: number, addressToUse: string) => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please go back and describe the issue you need help with",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
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
          lat,
          lng,
          address: addressToUse,
        },
        isVisitRequired,
      });
      
      setCurrentRequest(serviceRequest);
      setServiceRequestCreated(true);
      
      // Start technician search
      const assigned = await autoAssignTechnician(serviceRequest.id, lat, lng);
      
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
      setIsSearching(false);
    }
  };

  const handleConfirmLocationAndSearch = () => {
    if (!selectedLocation || !address.trim()) {
      toast({
        title: "Location required",
        description: "Please select a location on the map or use GPS",
        variant: "destructive",
      });
      return;
    }
    
    if (!serviceRequestCreated) {
      handleCreateServiceRequest(selectedLocation.lat, selectedLocation.lng, address);
    }
  };
  
  const formattedServiceType = serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1);
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => step === 'location' ? setStep('details') : navigate('/client/services')}
            className="flex items-center text-primary hover:underline mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {step === 'location' ? 'Back to details' : 'Back to services'}
          </button>
          
          <h1 className="text-3xl font-bold mb-6">
            {step === 'details' 
              ? `Book a ${formattedServiceType} Service` 
              : `Select Location & Find ${formattedServiceType}`
            }
          </h1>

          {step === 'details' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
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
                  Continue to Location & Technician Search
                </Button>
              </form>
            </div>
          )}

          {step === 'location' && (
            <div className="space-y-6">
              {/* Location Selection Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Step 1: Select Your Location</h2>
                
                <div className="space-y-4">
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
                      Enable GPS for automatic location detection or click on the map
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">
                      Interactive Location Map
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
                      <TrackingMap 
                        clientLocation={{
                          lat: selectedLocation?.lat || 40.7128,
                          lng: selectedLocation?.lng || -74.006,
                          address: address || 'Your location'
                        }}
                        onLocationUpdate={handleLocationUpdate}
                        className="h-80"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Click "My Location" for GPS or click anywhere on the map to select manually
                    </p>
                  </div>

                  {selectedLocation && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-medium text-green-800 mb-2">✅ Location Confirmed</h3>
                      <p className="text-sm text-green-700">
                        Latitude: {selectedLocation.lat.toFixed(6)}<br/>
                        Longitude: {selectedLocation.lng.toFixed(6)}<br/>
                        Address: {address}
                      </p>
                    </div>
                  )}

                  {!serviceRequestCreated && selectedLocation && (
                    <Button
                      onClick={handleConfirmLocationAndSearch}
                      className="w-full py-4 text-lg"
                      disabled={!selectedLocation || !address.trim() || isLoading}
                    >
                      {isLoading ? "Creating Service Request..." : "Confirm Location & Find Technicians"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Technician Search Section - Shows after location is selected */}
              {(selectedLocation && serviceRequestCreated) && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold mb-4">Step 2: Finding Available Technicians</h2>
                  
                  <TechnicianSearchProgress
                    isSearching={isSearching}
                    serviceType={serviceType as ServiceType}
                    location={selectedLocation ? {
                      lat: selectedLocation.lat,
                      lng: selectedLocation.lng,
                      address: address
                    } : undefined}
                    searchError={searchError}
                    onAutoAssign={async () => {
                      if (!selectedLocation || !currentRequest) return;
                      
                      setIsLoading(true);
                      setIsSearching(true);
                      setSearchError('');
                      
                      try {
                        const assigned = await autoAssignTechnician(
                          currentRequest.id,
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
                        setSearchError("Failed to find technician. Please try again.");
                      } finally {
                        setIsLoading(false);
                        setIsSearching(false);
                      }
                    }}
                  />
                  
                  {searchError && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setServiceRequestCreated(false);
                          setSearchError('');
                        }}
                        className="mr-2"
                      >
                        Change Location
                      </Button>
                      <Button 
                        onClick={() => {
                          setSearchError('');
                          handleCreateServiceRequest(selectedLocation.lat, selectedLocation.lng, address);
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions for better UX */}
              {step === 'location' && !selectedLocation && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">📍 How to select your location:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click the "My Location" button on the map for automatic GPS detection</li>
                    <li>• Or click anywhere on the map to manually select your location</li>
                    <li>• Type your address in the field above for manual entry</li>
                    <li>• Once location is set, we'll automatically start finding nearby technicians</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ServiceBooking;