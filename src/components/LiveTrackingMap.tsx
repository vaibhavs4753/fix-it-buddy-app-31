import React, { useEffect, useState } from 'react';
import { ServiceRequest, Technician } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeafletMap from './LeafletMap';
import { LatLngTuple } from 'leaflet';

interface LiveTrackingMapProps {
  serviceRequest: ServiceRequest;
  technician?: Technician;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ 
  serviceRequest, 
  technician, 
  onLocationUpdate 
}) => {
  const [mapError, setMapError] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate route information
  useEffect(() => {
    if (!serviceRequest.location || !technician || !technician.location) {
      setRouteInfo(null);
      return;
    }
    
    setIsCalculating(true);
    
    const calculateRoute = () => {
      // Use Haversine formula for distance calculation
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      
      const dLat = toRad(technician.location!.lat - serviceRequest.location!.lat);
      const dLng = toRad(technician.location!.lng - serviceRequest.location!.lng);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(serviceRequest.location!.lat)) * Math.cos(toRad(technician.location!.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      // Realistic time estimation
      const baseSpeed = 25; // km/h average in city
      const estimatedTime = Math.max(3, Math.round((distance / baseSpeed) * 60));
      
      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedTime} mins`
      });
      
      setIsCalculating(false);
    };
    
    const timer = setTimeout(calculateRoute, 1000);
    return () => clearTimeout(timer);
  }, [serviceRequest.location, technician]);

  // Subscribe to technician location updates
  useEffect(() => {
    if (!technician?.id) return;

    const channel = supabase
      .channel('technician-location')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'technician_profiles',
          filter: `id=eq.${technician.id}`,
        },
        (payload) => {
          console.log('Technician location update:', payload);
          if (payload.new.current_location_lat && payload.new.current_location_lng && onLocationUpdate) {
            onLocationUpdate({
              lat: payload.new.current_location_lat,
              lng: payload.new.current_location_lng,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [technician?.id, onLocationUpdate]);

  // Prepare markers for the map
  const markers = [];
  
  // Add client location marker
  if (serviceRequest.location) {
    markers.push({
      position: [serviceRequest.location.lat, serviceRequest.location.lng] as LatLngTuple,
      popup: `Client Location\n${serviceRequest.location.address || 'Service address'}`,
      icon: 'client' as const,
    });
  }
  
  // Add technician location marker
  if (technician?.location) {
    markers.push({
      position: [technician.location.lat, technician.location.lng] as LatLngTuple,
      popup: `${technician.name}\nTechnician Location`,
      icon: 'technician' as const,
    });
  }

  // Create route path if both locations exist
  const routePath: LatLngTuple[] = [];
  if (serviceRequest.location && technician?.location) {
    routePath.push(
      [technician.location.lat, technician.location.lng],
      [serviceRequest.location.lat, serviceRequest.location.lng]
    );
  }

  // Calculate center point for the map
  const center: LatLngTuple = serviceRequest.location 
    ? [serviceRequest.location.lat, serviceRequest.location.lng]
    : [51.505, -0.09]; // Default to London

  if (mapError) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-gray-600 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Route Information */}
      {routeInfo && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">{routeInfo.distance}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">{routeInfo.duration}</span>
            </div>
            {isCalculating && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Calculating...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Tracking Map */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-3 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Live Tracking</span>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
        </div>
        
        <LeafletMap
          center={center}
          zoom={14}
          height="400px"
          markers={markers}
          routePath={routePath}
          trackingMode={true}
        />
      </div>

      {/* Status Information */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">
              {technician ? `${technician.name} is on the way` : 'Waiting for technician assignment'}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {technician 
                ? 'You can track their real-time location on the map above.' 
                : 'Once a technician accepts your request, you\'ll be able to track their location here.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;