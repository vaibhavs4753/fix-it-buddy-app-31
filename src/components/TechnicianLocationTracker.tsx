import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TechnicianLocationTrackerProps {
  isActive?: boolean;
  onStatusChange?: (isActive: boolean) => void;
}

const TechnicianLocationTracker: React.FC<TechnicianLocationTrackerProps> = ({
  isActive = false,
  onStatusChange
}) => {
  const [tracking, setTracking] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const { toast } = useToast();

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Available",
        description: "Your device doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setPermissionRequested(true);

    try {
      // Request permission by attempting to get current position
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermissionGranted(true);
            resolve(position);
          },
          (error) => {
            console.error('Location permission denied:', error);
            toast({
              title: "Location Permission Required",
              description: "Please allow location access to share your location with clients",
              variant: "destructive"
            });
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });
    } catch (error) {
      setPermissionGranted(false);
    }
  };

  const updateLocation = async (lat: number, lng: number, accuracy?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-technician-location', {
        body: {
          lat,
          lng,
          availability_status: tracking ? 'available' : 'offline'
        }
      });

      if (error) throw error;

      setCurrentLocation({ lat, lng });
      setLastUpdate(new Date());
      if (accuracy) setAccuracy(accuracy);

      console.log('Location updated:', data);
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Location Update Failed",
        description: "Failed to update your location. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Available",
        description: "Your device doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateLocation(latitude, longitude, accuracy);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Error",
          description: "Failed to get your location. Please check your permissions.",
          variant: "destructive"
        });
      },
      options
    );

    setWatchId(id);
    setTracking(true);
    onStatusChange?.(true);

    toast({
      title: "Live Tracking Started",
      description: "Your location is now being shared with clients"
    });
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setTracking(false);
    onStatusChange?.(false);

    // Update availability to offline
    if (currentLocation) {
      updateLocation(currentLocation.lat, currentLocation.lng);
    }

    toast({
      title: "Tracking Stopped",
      description: "You are no longer sharing your location"
    });
  };

  const handleToggleTracking = () => {
    if (tracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  useEffect(() => {
    // Auto-request location permission on component mount
    requestLocationPermission();
  }, []);

  useEffect(() => {
    // Auto-start tracking when permission is granted
    if (permissionGranted && !tracking) {
      startTracking();
    }
  }, [permissionGranted]);

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <Card className={`${tracking ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className={`h-5 w-5 ${tracking ? 'text-green-600' : 'text-gray-400'}`} />
            <span>Location Sharing</span>
          </div>
          <Badge 
            variant={tracking ? "default" : "secondary"}
            className={tracking ? "bg-green-600" : ""}
          >
            {tracking ? (
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3 animate-pulse" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </div>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          {!permissionRequested ? (
            <p>Requesting location permission...</p>
          ) : !permissionGranted ? (
            <p>Location permission is required to share your location with clients. Please grant permission to continue.</p>
          ) : tracking ? (
            <p>Your location is being shared with clients who have requested your services.</p>
          ) : (
            <p>Starting location sharing...</p>
          )}
        </div>

        {currentLocation && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-mono">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </span>
            </div>
            
            {lastUpdate && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}

            {accuracy && accuracy < 50 && (
              <div className="text-xs text-green-600">
                📍 High accuracy: ±{Math.round(accuracy)}m
              </div>
            )}
          </div>
        )}

        {!permissionGranted && permissionRequested && (
          <Button
            onClick={requestLocationPermission}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Grant Location Permission
          </Button>
        )}

        {tracking && (
          <div className="text-xs text-center text-green-600 font-medium">
            ✓ Location sharing is active and automatic
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianLocationTracker;