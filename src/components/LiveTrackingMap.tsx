import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ServiceRequest, Technician } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const clientMarker = useRef<mapboxgl.Marker | null>(null);
  const technicianMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Get Mapbox token from Supabase secrets
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        // Fallback - use a placeholder or prompt user
        setMapboxToken('pk.eyJ1IjoidGVzdCIsImEiOiJjbGV0ZXN0In0.test'); // Replace with actual token
      }
    };
    getMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !serviceRequest.location) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [serviceRequest.location.lng, serviceRequest.location.lat],
      zoom: 14,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add client location marker
    const clientEl = document.createElement('div');
    clientEl.className = 'client-marker';
    clientEl.style.backgroundColor = '#000000';
    clientEl.style.width = '20px';
    clientEl.style.height = '20px';
    clientEl.style.borderRadius = '50%';
    clientEl.style.border = '3px solid white';
    clientEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

    clientMarker.current = new mapboxgl.Marker(clientEl)
      .setLngLat([serviceRequest.location.lng, serviceRequest.location.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3><p>Service requested here</p>'))
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, serviceRequest.location]);

  // Update technician marker
  useEffect(() => {
    if (!map.current || !technician?.location) return;

    if (technicianMarker.current) {
      technicianMarker.current.remove();
    }

    const techEl = document.createElement('div');
    techEl.className = 'technician-marker';
    techEl.style.backgroundColor = '#000000';
    techEl.style.width = '24px';
    techEl.style.height = '24px';
    techEl.style.borderRadius = '50%';
    techEl.style.border = '3px solid white';
    techEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    techEl.style.display = 'flex';
    techEl.style.alignItems = 'center';
    techEl.style.justifyContent = 'center';
    techEl.innerHTML = '🔧';

    technicianMarker.current = new mapboxgl.Marker(techEl)
      .setLngLat([technician.location.lng, technician.location.lat])
      .setPopup(new mapboxgl.Popup().setText(`${technician.name} - ${technician.serviceType} • ⭐ ${technician.rating}`))
      .addTo(map.current);

    // Fit map to show both markers
    if (serviceRequest.location) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([serviceRequest.location.lng, serviceRequest.location.lat]);
      bounds.extend([technician.location.lng, technician.location.lat]);
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 16
      });
    }

    onLocationUpdate?.(technician.location);
  }, [technician, serviceRequest.location, onLocationUpdate]);

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
            if (technicianMarker.current) {
              technicianMarker.current.setLngLat([newLocation.lng, newLocation.lat]);
            }

            onLocationUpdate?.(newLocation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [technician?.id, onLocationUpdate]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {!technician && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
          <p className="text-sm text-black">🔍 Looking for nearby technicians...</p>
        </div>
      )}
      
      {technician && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
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