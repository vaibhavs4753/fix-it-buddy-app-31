import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle, Polyline } from 'react-leaflet';
import { LatLngTuple, Icon, DivIcon } from 'leaflet';
import { MapPin, Navigation, Clock, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Fix for default markers in React Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  center?: LatLngTuple;
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: LatLngTuple;
    popup?: string;
    icon?: 'default' | 'technician' | 'client' | 'location';
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  showLocationButton?: boolean;
  trackingMode?: boolean;
  routePath?: LatLngTuple[];
  className?: string;
}

// Custom marker icons
const createCustomIcon = (type: string, color: string = '#3B82F6') => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="color: white; font-size: 12px; font-weight: bold;">
        ${type === 'technician' ? 'T' : type === 'client' ? 'C' : '📍'}
      </div>
    </div>
  `;
  
  return new DivIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map events
const MapEventHandler: React.FC<{
  onLocationSelect?: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Component to handle location finding
const LocationFinder: React.FC<{
  onLocationFound: (lat: number, lng: number) => void;
}> = ({ onLocationFound }) => {
  const map = useMap();
  const { toast } = useToast();

  const findLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Finding location...",
      description: "Please allow location access",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 16);
        onLocationFound(latitude, longitude);
        toast({
          title: "Location found!",
          description: "Map has been centered on your location",
        });
      },
      (error) => {
        let message = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    findLocation();
  }, []);

  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [51.505, -0.09], // Default to London
  zoom = 13,
  height = "400px",
  markers = [],
  onLocationSelect,
  showLocationButton = false,
  trackingMode = false,
  routePath = [],
  className = "",
}) => {
  const [currentLocation, setCurrentLocation] = useState<LatLngTuple | null>(null);
  const { toast } = useToast();

  const handleLocationFound = (lat: number, lng: number) => {
    setCurrentLocation([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  const getMarkerIcon = (iconType: string) => {
    switch (iconType) {
      case 'technician':
        return createCustomIcon('technician', '#10B981'); // Green
      case 'client':
        return createCustomIcon('client', '#3B82F6'); // Blue
      case 'location':
        return createCustomIcon('location', '#EF4444'); // Red
      default:
        return undefined; // Use default Leaflet icon
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {/* OpenStreetMap tiles - completely free! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map event handler for location selection */}
        <MapEventHandler onLocationSelect={onLocationSelect} />

        {/* Auto-location finder for tracking mode */}
        {trackingMode && <LocationFinder onLocationFound={handleLocationFound} />}

        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={marker.icon ? getMarkerIcon(marker.icon) : undefined}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {/* Current location marker */}
        {currentLocation && (
          <>
            <Marker position={currentLocation} icon={createCustomIcon('location', '#8B5CF6')}>
              <Popup>Your current location</Popup>
            </Marker>
            <Circle
              center={currentLocation}
              radius={100}
              pathOptions={{
                color: '#8B5CF6',
                fillColor: '#8B5CF6',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        {/* Route path */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#3B82F6',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>

      {/* Location button overlay */}
      {showLocationButton && (
        <div className="absolute top-4 right-4 z-[1000]">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    handleLocationFound(position.coords.latitude, position.coords.longitude);
                  },
                  (error) => {
                    toast({
                      title: "Location error",
                      description: "Unable to get your location",
                      variant: "destructive",
                    });
                  }
                );
              }
            }}
          >
            <Crosshair className="w-4 h-4 mr-1" />
            My Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;