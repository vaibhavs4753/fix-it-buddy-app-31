import React from 'react';
import LeafletMap from './LeafletMap';
import { LatLngTuple } from 'leaflet';

interface MapViewProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  className?: string;
}

const MapView = ({ origin, destination, className }: MapViewProps) => {
  // Prepare markers for origin and destination
  const markers = [];
  
  if (origin) {
    markers.push({
      position: [origin.lat, origin.lng] as LatLngTuple,
      popup: 'Origin',
      icon: 'client' as const,
    });
  }
  
  if (destination) {
    markers.push({
      position: [destination.lat, destination.lng] as LatLngTuple,
      popup: 'Destination',
      icon: 'location' as const,
    });
  }
  
  // Create route path if both points exist
  const routePath: LatLngTuple[] = [];
  if (origin && destination) {
    routePath.push([origin.lat, origin.lng], [destination.lat, destination.lng]);
  }
  
  // Calculate center point
  const center: LatLngTuple = origin 
    ? [origin.lat, origin.lng]
    : destination 
    ? [destination.lat, destination.lng]
    : [51.505, -0.09]; // Default to London

  return (
    <LeafletMap
      center={center}
      zoom={13}
      height="300px"
      markers={markers}
      routePath={routePath}
      className={className}
    />
  );
};

export default MapView;