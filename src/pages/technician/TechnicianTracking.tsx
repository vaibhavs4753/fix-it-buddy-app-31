import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useService } from '@/context/ServiceContext';
import { useAuth } from '@/context/AuthContext';
import TrackingMap from '@/components/TrackingMap';
import TechnicianLocationTracker from '@/components/TechnicianLocationTracker';
import ServiceIcon from '@/components/ServiceIcon';
import Footer from '@/components/Footer';
import { Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TechnicianTracking = () => {
  const { currentRequest } = useService();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [technicianLocation, setTechnicianLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!currentRequest) {
      navigate('/technician/home');
    }
  }, [currentRequest, navigate]);

  if (!currentRequest) {
    return null;
  }

  const clientMapLocation = {
    lat: currentRequest.location.lat,
    lng: currentRequest.location.lng,
    address: currentRequest.location.address
  };

  const technicianMapLocation = technicianLocation ? {
    lat: technicianLocation.lat,
    lng: technicianLocation.lng,
    name: 'Your Location'
  } : undefined;

  const handleLocationUpdate = (lat: number, lng: number) => {
    setTechnicianLocation({ lat, lng });
  };

  const handleContactClient = () => {
    toast({
      title: "Contact Client",
      description: "Would dial client's number in a real app",
    });
  };

  const handleCompleteService = () => {
    navigate('/technician/service-details');
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
    <div className="min-h-screen flex flex-col bg-neutral-900">
      {/* Header */}
      <header className="bg-black shadow-lg border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/technician/home')}
              className="text-neutral-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-primary">Live Tracking</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Service Info Card */}
          <Card className="bg-neutral-800 border-neutral-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <ServiceIcon type={currentRequest.serviceType} size={24} />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-white capitalize">
                    {currentRequest.serviceType} Service
                  </h2>
                  <p className="text-sm text-neutral-400 flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(new Date(currentRequest.createdAt))}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                In Progress
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-neutral-300">
                <MapPin size={16} className="mt-1 text-primary" />
                <div>
                  <p className="text-sm font-medium text-white">Client Location</p>
                  <p className="text-sm text-neutral-400">{currentRequest.location.address}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-700">
                <p className="text-sm font-medium text-white mb-1">Description</p>
                <p className="text-sm text-neutral-400">{currentRequest.description}</p>
              </div>
            </div>
          </Card>

          {/* Location Tracker */}
          <TechnicianLocationTracker 
            isActive={true}
            onStatusChange={() => {}}
            serviceRequestId={currentRequest.id}
            clientId={currentRequest.clientId}
          />

          {/* Live Map */}
          <Card className="bg-neutral-800 border-neutral-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Live Location</h3>
            <TrackingMap
              clientLocation={clientMapLocation}
              technicianLocation={technicianMapLocation}
              onLocationUpdate={handleLocationUpdate}
              showRoute={true}
            />
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleContactClient}
              className="flex items-center justify-center gap-2 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
            >
              <Phone size={18} />
              Contact Client
            </Button>
            
            <Button
              onClick={handleCompleteService}
              className="flex items-center justify-center"
            >
              Complete Service
            </Button>
          </div>

          {/* Tips */}
          <Card className="bg-neutral-800 border-neutral-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Service Tips</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Keep the client updated on your arrival time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Verify the service location before arriving</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Have all necessary tools ready for the job</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TechnicianTracking;
