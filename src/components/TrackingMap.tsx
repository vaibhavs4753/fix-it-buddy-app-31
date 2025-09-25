import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Navigation, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LeafletMap from './LeafletMap';
import { LatLngTuple } from 'leaflet';

interface TrackingMapProps {
  clientLocation: { lat: number; lng: number; address: string };
  technicianLocation?: { lat: number; lng: number; name: string };
  className?: string;
  showRoute?: boolean;
  onLocationUpdate?: (lat: number, lng: number, accuracy?: number, bearing?: number) => void;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: Array<{ instruction: string; distance: string }>;
}

const TrackingMap = ({ 
  clientLocation, 
  technicianLocation, 
  className = '',
  showRoute = false,
  onLocationUpdate 
}: TrackingMapProps) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // GPS Location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position);
        setLocationError(null);
        if (onLocationUpdate) {
          onLocationUpdate(
            position.coords.latitude, 
            position.coords.longitude,
            position.coords.accuracy,
            position.coords.heading || undefined
          );
        }
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        console.error('GPS Error:', error);
      },
      options
    );

    setIsTrackingLocation(true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTrackingLocation(false);
    };
  }, [onLocationUpdate]);

  // Calculate route information with more realistic data
  useEffect(() => {
    if (!clientLocation || !technicianLocation || !showRoute) {
      setRouteInfo(null);
      return;
    }
    
    setIsCalculating(true);
    
    const calculateRoute = () => {
      // More accurate distance calculation using Haversine formula
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      
      const dLat = toRad(technicianLocation.lat - clientLocation.lat);
      const dLng = toRad(technicianLocation.lng - clientLocation.lng);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(clientLocation.lat)) * Math.cos(toRad(technicianLocation.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      // More realistic time estimation based on urban traffic
      const baseSpeed = 25; // km/h average in city
      const estimatedTime = Math.max(3, Math.round((distance / baseSpeed) * 60));
      
      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedTime} mins`,
        steps: [
          { instruction: "Head northeast on current street", distance: `${(distance * 0.2).toFixed(1)} km` },
          { instruction: "Continue on main road", distance: `${(distance * 0.5).toFixed(1)} km` },
          { instruction: "Turn towards destination", distance: `${(distance * 0.2).toFixed(1)} km` },
          { instruction: "Arrive at destination", distance: `${(distance * 0.1).toFixed(1)} km` }
        ]
      });
      
      setIsCalculating(false);
    };
    
    const timer = setTimeout(calculateRoute, 1500);
    return () => clearTimeout(timer);
  }, [clientLocation, technicianLocation, showRoute]);

  // Prepare markers for the map
  const markers = [];
  
  // Add client location marker
  markers.push({
    position: [clientLocation.lat, clientLocation.lng] as LatLngTuple,
    popup: `Client Location\n${clientLocation.address}`,
    icon: 'client' as const,
  });
  
  // Add technician location marker if available
  if (technicianLocation) {
    markers.push({
      position: [technicianLocation.lat, technicianLocation.lng] as LatLngTuple,
      popup: `${technicianLocation.name}\nTechnician Location`,
      icon: 'technician' as const,
    });
  }

  // Add current GPS location if available
  if (currentPosition) {
    markers.push({
      position: [currentPosition.coords.latitude, currentPosition.coords.longitude] as LatLngTuple,
      popup: `Your GPS Location\nAccuracy: ${currentPosition.coords.accuracy?.toFixed(0)}m`,
      icon: 'location' as const,
    });
  }

  // Create route path if both locations exist
  const routePath: LatLngTuple[] = [];
  if (showRoute && technicianLocation) {
    routePath.push(
      [technicianLocation.lat, technicianLocation.lng],
      [clientLocation.lat, clientLocation.lng]
    );
  }

  // Calculate center point for the map
  const center: LatLngTuple = [clientLocation.lat, clientLocation.lng];

  const handleLocationSelect = (lat: number, lng: number) => {
    if (onLocationUpdate) {
      onLocationUpdate(lat, lng);
    }
    toast({
      title: "Location Updated",
      description: `New location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* GPS Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Crosshair className={`h-5 w-5 ${isTrackingLocation ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="font-medium text-gray-900">GPS Tracking</span>
          <div className={`h-2 w-2 rounded-full ${isTrackingLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
        {locationError && (
          <span className="text-sm text-red-600">{locationError}</span>
        )}
      </div>

      {/* Route Information */}
      {routeInfo && showRoute && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Route Information</h3>
            {isCalculating && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Calculating...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">{routeInfo.distance}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">{routeInfo.duration}</span>
            </div>
          </div>

          <div className="space-y-2">
            {routeInfo.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{step.instruction}</p>
                  <p className="text-gray-500">{step.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Map */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Location Tracking</span>
            </div>
            <span className="text-sm text-gray-500">Click map to update location</span>
          </div>
        </div>
        
        <LeafletMap
          center={center}
          zoom={15}
          height="400px"
          markers={markers}
          routePath={routePath}
          onLocationSelect={handleLocationSelect}
          showLocationButton={true}
          trackingMode={true}
        />
      </div>

      {/* Current Position Info */}
      {currentPosition && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Crosshair className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">GPS Location Active</p>
              <p className="text-sm text-green-700 mt-1">
                Accuracy: {currentPosition.coords.accuracy?.toFixed(0)}m | 
                Speed: {currentPosition.coords.speed ? `${(currentPosition.coords.speed * 3.6).toFixed(1)} km/h` : 'Unknown'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingMap;