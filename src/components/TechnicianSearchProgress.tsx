import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Wrench,
  Star,
  Navigation
} from 'lucide-react';
import { ServiceType, Technician } from '@/types';

interface TechnicianSearchProgressProps {
  isSearching: boolean;
  searchResults?: Technician[];
  selectedTechnician?: Technician;
  serviceType: ServiceType;
  location?: { lat: number; lng: number; address: string };
  onTechnicianSelect?: (technician: Technician) => void;
  onAutoAssign?: () => void;
  searchError?: string;
}

const TechnicianSearchProgress: React.FC<TechnicianSearchProgressProps> = ({
  isSearching,
  searchResults = [],
  selectedTechnician,
  serviceType,
  location,
  onTechnicianSelect,
  onAutoAssign,
  searchError
}) => {
  const [searchStage, setSearchStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const searchStages = [
    { label: 'Locating your position', icon: MapPin },
    { label: `Finding nearby ${serviceType}s`, icon: Search },
    { label: 'Checking availability', icon: Clock },
    { label: 'Matching preferences', icon: User },
    { label: 'Ready to assign', icon: CheckCircle2 }
  ];

  useEffect(() => {
    if (!isSearching) {
      setSearchStage(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setSearchStage(prev => {
        const next = prev < searchStages.length - 1 ? prev + 1 : prev;
        setProgress((next + 1) * 20);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSearching, searchStages.length]);

  const formatServiceType = (type: ServiceType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (searchError) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Search Failed</h3>
              <p className="text-sm text-red-700">{searchError}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onAutoAssign}
            className="w-full border-red-300 hover:bg-red-100"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (selectedTechnician) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-900">Technician Assigned!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{selectedTechnician.name}</h4>
              <div className="flex items-center space-x-3 mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Wrench className="h-3 w-3 mr-1" />
                  {formatServiceType(selectedTechnician.serviceType)}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{selectedTechnician.rating}</span>
                </div>
                {(selectedTechnician as any).distance && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Navigation className="h-3 w-3" />
                    <span>{((selectedTechnician as any).distance).toFixed(1)} km away</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{selectedTechnician.name}</strong> has been notified and is on the way to your location.
              You'll receive updates as they approach.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchResults.length > 0 && !isSearching) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span>Found {searchResults.length} Available {formatServiceType(serviceType)}s</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {searchResults.map((technician, index) => (
              <div 
                key={technician.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTechnicianSelect?.(technician)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{technician.name}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{technician.rating}</span>
                    </div>
                    {(technician as any).distance && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Navigation className="h-3 w-3" />
                        <span>{((technician as any).distance).toFixed(1)} km away</span>
                      </div>
                    )}
                    {index === 0 && (
                      <Badge className="bg-green-100 text-green-800">Closest</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Select
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onAutoAssign}
              className="flex-1"
            >
              Auto Assign Closest
            </Button>
            <Button 
              variant="outline"
              onClick={() => onTechnicianSelect?.(searchResults[0])}
              className="flex-1"
            >
              Select Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
          <span>Finding {formatServiceType(serviceType)} Near You</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Location info */}
          {location && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Searching around</p>
                <p className="text-sm text-blue-700">{location.address}</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Search Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Search stages */}
          <div className="space-y-3">
            {searchStages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = index === searchStage && isSearching;
              const isCompleted = index < searchStage;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-100 border border-blue-200' 
                      : isCompleted 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isActive ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⏱️ Average wait time: 2-5 minutes
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              We're scanning a 50km radius for the best available technician
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianSearchProgress;