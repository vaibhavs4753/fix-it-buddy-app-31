
import React, { useEffect, useRef } from 'react';

interface MapViewProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  className?: string;
}

const MapView = ({ origin, destination, className }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  // In a real app, we would use a mapping library like Mapbox or Google Maps
  // For this demo, we'll create a simple visual representation
  useEffect(() => {
    if (!mapRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = mapRef.current.clientWidth;
    canvas.height = mapRef.current.clientHeight;
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw map background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some "roads"
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    
    // Horizontal roads
    for (let y = 20; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical roads
    for (let x = 20; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw origin point if available
    if (origin) {
      const originX = canvas.width / 2 - 50;
      const originY = canvas.height / 2 + 50;
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(originX, originY, 10, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw destination if available
    if (destination) {
      const destX = canvas.width / 2 + 50;
      const destY = canvas.height / 2 - 50;
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(destX, destY, 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw a path between origin and destination
      if (origin) {
        const originX = canvas.width / 2 - 50;
        const originY = canvas.height / 2 + 50;
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.bezierCurveTo(
          originX + 30, originY - 30,
          destX - 30, destY + 30,
          destX, destY
        );
        ctx.stroke();
        
        // Distance indicator
        const midX = (originX + destX) / 2;
        const midY = (originY + destY) / 2;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(midX - 30, midY - 15, 60, 30, 15);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('2.5 km', midX, midY + 5);
      }
    }
    
  }, [origin, destination]);
  
  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 bg-white rounded-lg shadow ${className || ''}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-black">Loading map...</p>
      </div>
    </div>
  );
};

export default MapView;
