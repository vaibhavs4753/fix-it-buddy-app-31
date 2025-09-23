import React, { useEffect, useRef, useState } from 'react';
import { ServiceRequest, Technician } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Declare global Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

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
  const map = useRef<any>(null);
  const clientMarker = useRef<any>(null);
  const technicianMarker = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string>('');

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      // Create script element for Google Maps
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      
      // Check if script already exists
      if (document.getElementById('google-maps-script')) {
        setIsMapLoaded(true);
        return;
      }
      
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsMapLoaded(true);
      };
      
      script.onerror = () => {
        setMapError('Failed to load Google Maps. Please check your API key.');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isMapLoaded || !serviceRequest.location) return;

    try {
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: serviceRequest.location.lat, lng: serviceRequest.location.lng },
        zoom: 14,
        styles: [
          {
            "featureType": "all",
            "elementType": "all",
            "stylers": [
              { "saturation": -100 },
              { "lightness": 50 }
            ]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add client location marker
      clientMarker.current = new window.google.maps.Marker({
        position: { lat: serviceRequest.location.lat, lng: serviceRequest.location.lng },
        map: map.current,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#000000" stroke="#ffffff" stroke-width="3"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">YOU</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: '<h3>Your Location</h3><p>Service requested here</p>'
      });

      clientMarker.current.addListener('click', () => {
        infoWindow.open(map.current, clientMarker.current);
      });

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapError('Failed to initialize map');
    }
  }, [isMapLoaded, serviceRequest.location]);

  // Update technician marker
  useEffect(() => {
    if (!map.current || !technician?.location || !isMapLoaded) return;

    try {
      if (technicianMarker.current) {
        technicianMarker.current.setMap(null);
      }

      technicianMarker.current = new window.google.maps.Marker({
        position: { lat: technician.location.lat, lng: technician.location.lng },
        map: map.current,
        title: `${technician.name} - ${technician.serviceType}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#000000" stroke="#ffffff" stroke-width="3"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">TECH</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      const techInfoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${technician.name}</strong><br/>${technician.serviceType} • ⭐ ${technician.rating}</div>`
      });

      technicianMarker.current.addListener('click', () => {
        techInfoWindow.open(map.current, technicianMarker.current);
      });

      // Fit map to show both markers
      if (serviceRequest.location) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: serviceRequest.location.lat, lng: serviceRequest.location.lng });
        bounds.extend({ lat: technician.location.lat, lng: technician.location.lng });
        
        map.current.fitBounds(bounds, { padding: 50 });
      }

      onLocationUpdate?.(technician.location);
    } catch (error) {
      console.error('Error updating technician marker:', error);
    }
  }, [technician, serviceRequest.location, onLocationUpdate, isMapLoaded]);

  // Real-time location updates
  useEffect(() => {
    if (!technician?.id) return;

    const channel = supabase
      .channel(`technician-location-${technician.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'technician_profiles',
          filter: `user_id=eq.${technician.id}`
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.current_location_lat && newData.current_location_lng) {
            const newLocation = {
              lat: parseFloat(newData.current_location_lat),
              lng: parseFloat(newData.current_location_lng)
            };

            // Update marker position
            if (technicianMarker.current && isMapLoaded) {
              technicianMarker.current.setPosition(newLocation);
            }

            onLocationUpdate?.(newLocation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [technician?.id, onLocationUpdate, isMapLoaded]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white border rounded-lg">
        <div className="text-center p-4">
          <p className="text-black mb-2">⚠️ Map Error</p>
          <p className="text-sm text-black">{mapError}</p>
          <p className="text-xs text-black mt-2">Please configure your Google Maps API key</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-black">Loading Google Maps...</p>
          </div>
        </div>
      )}
      
      {!technician && isMapLoaded && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
          <p className="text-sm text-black">🔍 Looking for nearby technicians...</p>
        </div>
      )}
      
      {technician && isMapLoaded && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-sm">{technician.name}</p>
              <p className="text-xs text-black">{technician.serviceType} • ⭐ {technician.rating}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;