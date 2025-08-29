import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Star, Phone, Navigation } from 'lucide-react';
import { useService } from '@/context/ServiceContext';
import { useAuth } from '@/context/AuthContext';
import LiveTrackingMap from '@/components/LiveTrackingMap';
import { ServiceRequest, Technician } from '@/types';
import Footer from '@/components/Footer';

const Tracking = () => {
  const { 
    getRequestsForClient, 
    availableTechnicians, 
    currentRequest,
    autoAssignTechnician,
    trackTechnicianLocation,
    findNearbyTechnicians
  } = useService();
  const { user } = useAuth();
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [assignedTechnicians, setAssignedTechnicians] = useState<{ [key: string]: Technician }>({});
  const [technicianLocations, setTechnicianLocations] = useState<{ [key: string]: { lat: number; lng: number } }>({});

  useEffect(() => {
    if (user) {
      const requests = getRequestsForClient(user.id);
      const active = requests.filter(r => ['pending', 'accepted'].includes(r.status));
      setActiveRequests(active);
      
      // Load technician data for accepted requests
      active.forEach(async (request) => {
        if (request.technicianId && !assignedTechnicians[request.technicianId]) {
          const tech = availableTechnicians.find(t => t.id === request.technicianId);
          if (tech) {
            setAssignedTechnicians(prev => ({ ...prev, [request.technicianId!]: tech }));
          }
          
          // Track technician location
          const location = await trackTechnicianLocation(request.technicianId);
          if (location) {
            setTechnicianLocations(prev => ({ ...prev, [request.technicianId!]: location }));
          }
        }
      });
    }
  }, [user, getRequestsForClient, availableTechnicians, trackTechnicianLocation]);

  const getAssignedTechnician = (request: ServiceRequest) => {
    if (!request.technicianId) return null;
    return assignedTechnicians[request.technicianId] || 
           availableTechnicians.find(tech => tech.id === request.technicianId);
  };

  const handleAutoAssign = async (request: ServiceRequest) => {
    if (request.location) {
      const success = await autoAssignTechnician(
        request.id, 
        request.location.lat, 
        request.location.lng
      );
      
      if (success) {
        // Refresh the requests to get updated data
        const updatedRequests = getRequestsForClient(user!.id);
        setActiveRequests(updatedRequests.filter(r => ['pending', 'accepted'].includes(r.status)));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-6 space-y-6 flex-grow">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Live Service Tracking</h1>
          <Badge variant="outline" className="px-4 py-2">
            {activeRequests.length} Active Request{activeRequests.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {activeRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Navigation className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Requests</h3>
              <p className="text-gray-600">You don't have any active service requests to track.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {activeRequests.map((request) => {
              const technician = getAssignedTechnician(request);
              
              return (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <span className="capitalize">{request.serviceType}</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </CardTitle>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Service Details</h4>
                      <p className="text-gray-600">{request.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location.address}</span>
                    </div>

                    {/* Live Tracking Map */}
                    <div className="h-80 rounded-lg overflow-hidden border">
                      <LiveTrackingMap
                        serviceRequest={request}
                        technician={technician}
                        onLocationUpdate={(location) => {
                          if (technician) {
                            setTechnicianLocations(prev => ({
                              ...prev,
                              [technician.id]: location
                            }));
                          }
                        }}
                      />
                    </div>

                    {technician ? (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-green-800">Technician Assigned</h4>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            <Navigation className="h-3 w-3 mr-1 animate-pulse" />
                            Live Tracking
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                                  {technician.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                              </div>
                              <div>
                                <p className="font-medium">{technician.name}</p>
                                <p className="text-sm text-gray-600 capitalize">{technician.serviceType}</p>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span>{technician.rating}</span>
                                </div>
                              </div>
                            </div>
                            
                            {technician.phone && (
                              <Button variant="outline" size="sm" className="w-full">
                                <Phone className="h-4 w-4 mr-2" />
                                Call {technician.name}
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <span className="font-medium text-green-600">En Route</span>
                            </div>
                            {technicianLocations[technician.id] && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Last Location:</span>
                                <span className="font-mono text-xs">
                                  {technicianLocations[technician.id].lat.toFixed(4)}, {technicianLocations[technician.id].lng.toFixed(4)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Service:</span>
                              <span className="font-medium capitalize">{request.serviceType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-yellow-800">Finding Technician</h4>
                          <Button 
                            onClick={() => handleAutoAssign(request)}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Auto Assign
                          </Button>
                        </div>
                        <p className="text-yellow-700 text-sm mb-3">
                          Searching for qualified technicians in your area...
                        </p>
                        <div className="animate-pulse flex space-x-2">
                          <div className="h-2 bg-yellow-200 rounded flex-1"></div>
                          <div className="h-2 bg-yellow-200 rounded flex-1"></div>
                          <div className="h-2 bg-yellow-300 rounded flex-1"></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tracking;