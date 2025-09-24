import React, { useEffect, useRef, useState } from 'react';
import { ServiceRequest, Technician } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const mapContainer = useRef<HTMLDivElement>(null);
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

  // Render custom map
  useEffect(() => {
    if (!mapContainer.current || !serviceRequest.location) return;

    const canvas = document.createElement('canvas');
    const rect = mapContainer.current.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 400;
    mapContainer.current.innerHTML = '';
    mapContainer.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Modern map background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw street grid with modern styling
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Major streets
    for (let y = 60; y < canvas.height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    for (let x = 80; x < canvas.width; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Minor streets
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1.5;
    for (let y = 30; y < canvas.height; y += 60) {
      if (y % 120 !== 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    
    for (let x = 40; x < canvas.width; x += 70) {
      if (x % 140 !== 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }
    
    // Calculate marker positions
    const clientX = canvas.width * 0.3;
    const clientY = canvas.height * 0.7;
    const techX = technician && technician.location ? canvas.width * 0.7 : clientX;
    const techY = technician && technician.location ? canvas.height * 0.3 : clientY;
    
    // Draw route if technician exists
    if (technician && technician.location && routeInfo) {
      // Route line with shadow
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 8;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.moveTo(clientX + 2, clientY + 2);
      const controlX1 = clientX + (techX - clientX) * 0.3;
      const controlY1 = clientY - 80;
      const controlX2 = techX - (techX - clientX) * 0.3;
      const controlY2 = techY - 80;
      ctx.bezierCurveTo(controlX1 + 2, controlY1 + 2, controlX2 + 2, controlY2 + 2, techX + 2, techY + 2);
      ctx.stroke();
      
      // Main route line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(clientX, clientY);
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, techX, techY);
      ctx.stroke();
      
      // Direction indicators
      const numArrows = 3;
      for (let i = 1; i <= numArrows; i++) {
        const t = i / (numArrows + 1);
        const x = (1-t)*(1-t)*(1-t)*clientX + 3*(1-t)*(1-t)*t*controlX1 + 3*(1-t)*t*t*controlX2 + t*t*t*techX;
        const y = (1-t)*(1-t)*(1-t)*clientY + 3*(1-t)*(1-t)*t*controlY1 + 3*(1-t)*t*t*controlY2 + t*t*t*techY;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(techY - clientY, techX - clientX));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-6, -3);
        ctx.lineTo(0, 0);
        ctx.lineTo(-6, 3);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Draw client location pin
    drawLocationPin(ctx, clientX, clientY, '#3b82f6', 'YOU');
    
    // Draw technician location pin
    if (technician && technician.location) {
      drawLocationPin(ctx, techX, techY, '#ef4444', 'TECH');
    }
    
    // Draw landmarks
    const landmarks = [
      { x: canvas.width * 0.15, y: canvas.height * 0.25, label: 'Hospital', color: '#10b981' },
      { x: canvas.width * 0.85, y: canvas.height * 0.75, label: 'Shopping', color: '#f59e0b' },
      { x: canvas.width * 0.5, y: canvas.height * 0.1, label: 'Park', color: '#10b981' }
    ];
    
    landmarks.forEach(landmark => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(landmark.x - 20, landmark.y - 8, 40, 16, 8);
      ctx.fill();
      
      ctx.strokeStyle = landmark.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = landmark.color;
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(landmark.label, landmark.x, landmark.y + 2);
    });
    
  }, [serviceRequest.location, technician, routeInfo]);
  
  // Helper function to draw location pins
  const drawLocationPin = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) => {
    // Pin shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 2, 12, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pin body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 20, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pin border
    ctx.strokeStyle = color === '#3b82f6' ? '#1d4ed8' : '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Pin pointer
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y - 20);
    ctx.lineTo(x + 10, y - 20);
    ctx.closePath();
    ctx.fill();
    
    // Pin label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 16);
  };

  // Real-time location tracking with updates
  useEffect(() => {
    if (!technician) return;

    const trackLocation = async () => {
      try {
        const { data, error } = await supabase
          .from('technician_profiles')
          .select('current_location_lat, current_location_lng')
          .eq('user_id', technician.id)
          .single();

        if (error) throw error;

        if (data && data.current_location_lat && data.current_location_lng) {
          const newPosition = {
            lat: data.current_location_lat,
            lng: data.current_location_lng
          };

          // Call callback if provided
          if (onLocationUpdate) {
            onLocationUpdate(newPosition);
          }
        }
      } catch (error) {
        console.error('Error tracking technician location:', error);
      }
    };

    // Track location immediately
    trackLocation();

    // Set up real-time subscription
    const channel = supabase
      .channel('technician-location-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'technician_profiles',
          filter: `user_id=eq.${technician.id}`
        },
        (payload) => {
          const { current_location_lat, current_location_lng } = payload.new;
          if (current_location_lat && current_location_lng) {
            const newPosition = {
              lat: current_location_lat,
              lng: current_location_lng
            };

            // Call callback if provided
            if (onLocationUpdate) {
              onLocationUpdate(newPosition);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [technician, onLocationUpdate]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
      {mapError ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-red-600 p-4">
          <AlertCircle className="w-12 h-12 mb-4" />
          <div className="text-lg font-semibold mb-2">Unable to Load Map</div>
          <div className="text-sm text-center">{mapError}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div 
          ref={mapContainer} 
          className="w-full h-full bg-slate-50"
        />
      )}

      {/* Route Information Panel */}
      {technician && technician.location && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border">
          <div className="flex items-center space-x-2 mb-3">
            <Navigation className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Live Tracking</span>
          </div>
          
          {isCalculating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Calculating route...</span>
            </div>
          ) : routeInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Distance:</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{routeInfo.distance}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">ETA:</span>
                </div>
                <span className="text-sm font-bold text-green-600">{routeInfo.duration}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Searching state */}
      {!technician && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Looking for nearby technicians...</span>
          </div>
        </div>
      )}

      {/* Location Information */}
      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 border">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Your Location:</span>
            <span className="text-sm text-gray-600 truncate">
              {serviceRequest.location?.address || 'Location set'}
            </span>
          </div>
          
          {technician && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Technician:</span>
              <span className="text-sm text-gray-600">{technician.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function extension for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  (CanvasRenderingContext2D.prototype as any).roundRect = function(x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
  };
}

export default LiveTrackingMap;