
import React, { useEffect, useRef, useState } from 'react';
import { Clock, MapPin, Navigation, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const mapRef = useRef<HTMLDivElement>(null);
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
          onLocationUpdate(position.coords.latitude, position.coords.longitude);
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
    
    const timer = setTimeout(calculateRoute, 1000);
    return () => clearTimeout(timer);
  }, [clientLocation, technicianLocation, showRoute]);
  
  // Enhanced Google Maps-like rendering
  useEffect(() => {
    if (!mapRef.current) return;
    
    const canvas = document.createElement('canvas');
    const rect = mapRef.current.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 400;
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Google Maps-like background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f5f5f5');
    gradient.addColorStop(0.3, '#e8f4f8');
    gradient.addColorStop(1, '#d6e9f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw realistic street grid
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Major streets (horizontal)
    for (let y = 60; y < canvas.height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      
      // Street outlines for depth
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    // Major streets (vertical)
    for (let x = 80; x < canvas.width; x += 120) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    // Minor streets
    ctx.strokeStyle = '#f8f8f8';
    ctx.lineWidth = 2;
    for (let y = 30; y < canvas.height; y += 50) {
      if (y % 100 !== 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    
    for (let x = 40; x < canvas.width; x += 60) {
      if (x % 120 !== 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }
    
    // Use GPS location if available, otherwise use provided location
    const displayClientLat = currentPosition?.coords.latitude || clientLocation.lat;
    const displayClientLng = currentPosition?.coords.longitude || clientLocation.lng;
    
    // Calculate positions with some spread for better visibility
    const clientX = canvas.width * 0.3;
    const clientY = canvas.height * 0.7;
    const techX = technicianLocation ? canvas.width * 0.7 : clientX;
    const techY = technicianLocation ? canvas.height * 0.3 : clientY;
    
    // Draw route with Google Maps-like styling
    if (technicianLocation && showRoute && routeInfo) {
      // Route shadow for depth
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 8;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.moveTo(clientX + 2, clientY + 2);
      const controlX1 = clientX + (techX - clientX) * 0.3;
      const controlY1 = clientY - 60;
      const controlX2 = techX - (techX - clientX) * 0.3;
      const controlY2 = techY - 60;
      ctx.bezierCurveTo(controlX1 + 2, controlY1 + 2, controlX2 + 2, controlY2 + 2, techX + 2, techY + 2);
      ctx.stroke();
      
      // Main route line
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(clientX, clientY);
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, techX, techY);
      ctx.stroke();
      
      // Route border
      ctx.strokeStyle = '#1a73e8';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Direction arrows
      const numArrows = 4;
      for (let i = 1; i <= numArrows; i++) {
        const t = i / (numArrows + 1);
        const x = (1-t)*(1-t)*(1-t)*clientX + 3*(1-t)*(1-t)*t*controlX1 + 3*(1-t)*t*t*controlX2 + t*t*t*techX;
        const y = (1-t)*(1-t)*(1-t)*clientY + 3*(1-t)*(1-t)*t*controlY1 + 3*(1-t)*t*t*controlY2 + t*t*t*techY;
        
        // Arrow direction
        const angle = Math.atan2(techY - clientY, techX - clientX);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(0, 0);
        ctx.lineTo(-8, 4);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Enhanced location pins with Google Maps styling
    // Client location (blue pin with accuracy circle if GPS)
    if (currentPosition) {
      const accuracy = currentPosition.coords.accuracy || 10;
      const accuracyRadius = Math.min(accuracy / 5, 30);
      
      // Accuracy circle
      ctx.fillStyle = 'rgba(66, 133, 244, 0.2)';
      ctx.beginPath();
      ctx.arc(clientX, clientY, accuracyRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Client pin shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(clientX + 2, clientY + 2, 12, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Client pin
    ctx.fillStyle = '#4285f4';
    ctx.beginPath();
    ctx.arc(clientX, clientY - 20, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#1a73e8';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1a73e8';
    ctx.stroke();
    
    // Client pin pointer
    ctx.beginPath();
    ctx.moveTo(clientX, clientY);
    ctx.lineTo(clientX - 10, clientY - 20);
    ctx.lineTo(clientX + 10, clientY - 20);
    ctx.closePath();
    ctx.fill();
    
    // Client label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', clientX, clientY - 15);
    
    // Technician location
    if (technicianLocation) {
      // Technician pin shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(techX + 2, techY + 2, 12, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Technician pin
      ctx.fillStyle = '#ea4335';
      ctx.beginPath();
      ctx.arc(techX, techY - 20, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#d33b2c';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Technician pin pointer
      ctx.beginPath();
      ctx.moveTo(techX, techY);
      ctx.lineTo(techX - 10, techY - 20);
      ctx.lineTo(techX + 10, techY - 20);
      ctx.closePath();
      ctx.fill();
      
      // Technician label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TECH', techX, techY - 16);
    }
    
    // Building and landmark indicators with Google Maps styling
    const landmarks = [
      { x: canvas.width * 0.15, y: canvas.height * 0.3, label: 'Hospital', color: '#34a853' },
      { x: canvas.width * 0.85, y: canvas.height * 0.7, label: 'Mall', color: '#fbbc04' },
      { x: canvas.width * 0.5, y: canvas.height * 0.15, label: 'Park', color: '#34a853' }
    ];
    
    landmarks.forEach(landmark => {
      // Landmark shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.roundRect(landmark.x - 18, landmark.y - 6, 36, 14, 6);
      ctx.fill();
      
      // Landmark background
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(landmark.x - 20, landmark.y - 8, 40, 16, 8);
      ctx.fill();
      
      // Landmark border
      ctx.strokeStyle = landmark.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Landmark text
      ctx.fillStyle = landmark.color;
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(landmark.label, landmark.x, landmark.y + 2);
    });
    
  }, [clientLocation, technicianLocation, showRoute, routeInfo, currentPosition]);

  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Your device doesn't support GPS tracking",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition(position);
        toast({
          title: "GPS Enabled",
          description: "Your location is now being tracked",
        });
      },
      (error) => {
        toast({
          title: "GPS Error",
          description: "Unable to access your location. Please check permissions.",
          variant: "destructive",
        });
      }
    );
  };
  
  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full bg-white rounded-lg shadow-lg border overflow-hidden"
      >
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-black">Loading GPS tracking map...</p>
        </div>
      </div>
      
      {/* GPS Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          size="sm"
          variant={isTrackingLocation ? "default" : "outline"}
          onClick={handleEnableGPS}
          className="shadow-lg"
        >
          <Crosshair className="h-4 w-4 mr-1" />
          {isTrackingLocation ? 'GPS On' : 'Enable GPS'}
        </Button>
        
        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
            {locationError}
          </div>
        )}
      </div>
      
      {/* GPS Status */}
      {currentPosition && (
        <div className="absolute top-16 right-4 bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="text-xs text-green-700">
            <div className="font-medium">GPS Active</div>
            <div>Accuracy: ±{Math.round(currentPosition.coords.accuracy || 0)}m</div>
          </div>
        </div>
      )}
      
      {/* Route Information Panel */}
      {showRoute && technicianLocation && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border">
          <div className="flex items-center space-x-2 mb-3">
            <Navigation className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-black">Live Tracking</span>
          </div>
          
          {isCalculating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
              <span className="text-sm text-black">Calculating route...</span>
            </div>
          ) : routeInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-black" />
                  <span className="text-sm font-medium">Distance:</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{routeInfo.distance}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-black" />
                  <span className="text-sm font-medium">ETA:</span>
                </div>
                <span className="text-sm font-bold text-green-600">{routeInfo.duration}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Location Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 border">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium">Your Location:</span>
            <span className="text-sm text-black truncate">
              {currentPosition ? 
                `GPS: ${currentPosition.coords.latitude.toFixed(4)}, ${currentPosition.coords.longitude.toFixed(4)}` :
                clientLocation.address
              }
            </span>
          </div>
          
          {technicianLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm font-medium">Technician:</span>
              <span className="text-sm text-black">{technicianLocation.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
