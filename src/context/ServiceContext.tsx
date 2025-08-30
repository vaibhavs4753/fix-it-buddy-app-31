
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceRequest, ServiceType, Technician } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ServiceContextType {
  serviceRequests: ServiceRequest[];
  availableTechnicians: Technician[];
  createServiceRequest: (request: Partial<ServiceRequest>) => Promise<ServiceRequest>;
  acceptServiceRequest: (requestId: string) => Promise<void>;
  cancelServiceRequest: (requestId: string) => Promise<void>;
  completeServiceRequest: (requestId: string, personalId: string) => Promise<boolean>;
  getRequestsForTechnician: (serviceType: ServiceType) => ServiceRequest[];
  getRequestsForClient: (clientId: string) => ServiceRequest[];
  getTechniciansByServiceType: (serviceType: ServiceType) => Technician[];
  findNearbyTechnicians: (serviceType: ServiceType, lat: number, lng: number) => Promise<Technician[]>;
  currentRequest: ServiceRequest | null;
  setCurrentRequest: (request: ServiceRequest | null) => void;
  refreshRequests: () => Promise<void>;
  autoAssignTechnician: (requestId: string, lat: number, lng: number) => Promise<boolean>;
  trackTechnicianLocation: (technicianId: string) => Promise<{ lat: number; lng: number } | null>;
  onlineTechnicians: string[];
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);
  const [onlineTechnicians, setOnlineTechnicians] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load service requests and technicians, setup realtime
  useEffect(() => {
    if (user) {
      refreshRequests();
      loadTechnicians();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to technician profile changes for real-time location updates
    const profileChannel = supabase
      .channel('technician-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'technician_profiles',
          filter: 'is_available=eq.true'
        },
        () => {
          loadTechnicians(); // Reload when technician data changes
        }
      )
      .subscribe();

    // Subscribe to service request changes
    const requestChannel = supabase
      .channel('service-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests'
        },
        () => {
          refreshRequests(); // Reload when requests change
        }
      )
      .subscribe();

    // Setup technician presence tracking
    const presenceChannel = supabase
      .channel('technician-presence')
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const onlineIds = Object.keys(newState).map(key => 
          key // Use the key as the technician ID
        ).filter(Boolean);
        setOnlineTechnicians(onlineIds);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(requestChannel);
      supabase.removeChannel(presenceChannel);
    };
  };

  const refreshRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert database format to ServiceRequest format
      const requests: ServiceRequest[] = data.map(row => ({
        id: row.id,
        clientId: row.client_id,
        technicianId: row.technician_id,
        serviceType: row.service_type as ServiceType,
        description: row.description,
        mediaUrls: row.media_urls || [],
        mediaType: row.media_type as any,
        status: row.status as any,
        location: {
          lat: parseFloat(row.location_lat.toString()),
          lng: parseFloat(row.location_lng.toString()),
          address: row.location_address
        },
        paymentMethod: row.payment_method as any,
        isVisitRequired: row.is_visit_required,
        createdAt: new Date(row.created_at)
      }));

      setServiceRequests(requests);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load service requests",
        variant: "destructive"
      });
    }
  };

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technician_profiles')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;

      const technicians: Technician[] = data.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        phone: profile.phone || '',
        type: 'technician' as const,
        serviceType: profile.service_type as ServiceType,
        description: profile.description || '',
        rating: parseFloat(profile.rating?.toString() || '4.5'),
        profileImage: profile.profile_image_url,
        location: profile.current_location_lat && profile.current_location_lng ? {
          lat: parseFloat(profile.current_location_lat.toString()),
          lng: parseFloat(profile.current_location_lng.toString())
        } : undefined
      }));

      setAvailableTechnicians(technicians);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load technicians",
        variant: "destructive"
      });
    }
  };

  const createServiceRequest = async (request: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          service_type: request.serviceType || 'electrician',
          description: request.description || '',
          media_urls: request.mediaUrls || [],
          media_type: request.mediaType || 'none',
          location_lat: request.location?.lat || 0,
          location_lng: request.location?.lng || 0,
          location_address: request.location?.address || '',
          payment_method: request.paymentMethod,
          is_visit_required: request.isVisitRequired || false
        })
        .select()
        .single();

      if (error) throw error;

      const newRequest: ServiceRequest = {
        id: data.id,
        clientId: data.client_id,
        serviceType: data.service_type as ServiceType,
        description: data.description,
        mediaUrls: data.media_urls || [],
        mediaType: data.media_type as any,
        status: data.status as any,
        location: {
          lat: parseFloat(data.location_lat.toString()),
          lng: parseFloat(data.location_lng.toString()),
          address: data.location_address
        },
        paymentMethod: data.payment_method as any,
        isVisitRequired: data.is_visit_required,
        createdAt: new Date(data.created_at)
      };

      await refreshRequests();
      toast({
        title: "Service Request Created",
        description: "Your service request has been created successfully."
      });
      
      return newRequest;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service request",
        variant: "destructive"
      });
      throw error;
    }
  };

  const acceptServiceRequest = async (requestId: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          status: 'accepted',
          technician_id: user.id
        })
        .eq('id', requestId);

      if (error) throw error;

      await refreshRequests();
      toast({
        title: "Service Request Accepted",
        description: "You have successfully accepted the service request."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept service request",
        variant: "destructive"
      });
    }
  };

  const cancelServiceRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      await refreshRequests();
      toast({
        title: "Service Request Cancelled",
        description: "The service request has been cancelled."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel service request",
        variant: "destructive"
      });
    }
  };

  const completeServiceRequest = async (requestId: string, personalId: string): Promise<boolean> => {
    if (!personalId) {
      toast({
        title: "Invalid Personal ID",
        description: "The personal ID you entered is incorrect.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);

      if (error) throw error;

      await refreshRequests();
      toast({
        title: "Service Completed",
        description: "Thank you for completing the service!"
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete service request",
        variant: "destructive"
      });
      return false;
    }
  };

  const getRequestsForTechnician = (serviceType: ServiceType): ServiceRequest[] => {
    return serviceRequests.filter(
      request => request.serviceType === serviceType && request.status === 'pending'
    );
  };

  const getRequestsForClient = (clientId: string): ServiceRequest[] => {
    return serviceRequests.filter(request => request.clientId === clientId);
  };

  const getTechniciansByServiceType = (serviceType: ServiceType): Technician[] => {
    return availableTechnicians.filter(technician => technician.serviceType === serviceType);
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearbyTechnicians = async (serviceType: ServiceType, lat: number, lng: number): Promise<Technician[]> => {
    try {
      // Fetch real-time available technicians with location data
      const { data, error } = await supabase
        .from('technician_profiles')
        .select('*')
        .eq('service_type', serviceType)
        .eq('is_available', true)
        .eq('availability_status', 'available')
        .not('current_location_lat', 'is', null)
        .not('current_location_lng', 'is', null);

      if (error) throw error;

      const techniciansWithLocation: Technician[] = data.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        phone: profile.phone || '',
        type: 'technician' as const,
        serviceType: profile.service_type as ServiceType,
        description: profile.description || '',
        rating: parseFloat(profile.rating?.toString() || '4.5'),
        profileImage: profile.profile_image_url,
        location: {
          lat: parseFloat(profile.current_location_lat.toString()),
          lng: parseFloat(profile.current_location_lng.toString())
        }
      }));

      // Calculate distances and sort by proximity (within 50km radius)
      const techniciansWithDistance = techniciansWithLocation
        .map(tech => ({
          ...tech,
          distance: calculateDistance(lat, lng, tech.location!.lat, tech.location!.lng)
        }))
        .filter(tech => tech.distance <= 50) // Only include technicians within 50km
        .sort((a, b) => a.distance - b.distance);

    return techniciansWithDistance.slice(0, 5); // Return top 5 nearest
    } catch (error) {
      console.error('Error finding nearby technicians:', error);
      toast({
        title: "Error",
        description: "Failed to find nearby technicians",
        variant: "destructive"
      });
      return [];
    }
  };

  const autoAssignTechnician = async (requestId: string, lat: number, lng: number): Promise<boolean> => {
    try {
      // Find the service request to get service type
      const request = serviceRequests.find(r => r.id === requestId);
      if (!request) return false;

      // Find nearby technicians
      const nearbyTechnicians = await findNearbyTechnicians(request.serviceType, lat, lng);
      
      if (nearbyTechnicians.length === 0) {
        toast({
          title: "No Technicians Available",
          description: "No technicians found in your area. Please try again later.",
          variant: "destructive"
        });
        return false;
      }

      // Assign the closest available technician
      const closestTechnician = nearbyTechnicians[0];
      const { error } = await supabase
        .from('service_requests')
        .update({
          status: 'accepted',
          technician_id: closestTechnician.id
        })
        .eq('id', requestId);

      if (error) throw error;

      await refreshRequests();
      toast({
        title: "Technician Assigned",
        description: `${closestTechnician.name} has been assigned to your request and is on the way!`
      });
      
      return true;
    } catch (error) {
      console.error('Error auto-assigning technician:', error);
      toast({
        title: "Error",
        description: "Failed to assign technician automatically",
        variant: "destructive"
      });
      return false;
    }
  };

  const trackTechnicianLocation = async (technicianId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { data, error } = await supabase
        .from('technician_profiles')
        .select('current_location_lat, current_location_lng')
        .eq('user_id', technicianId)
        .single();

      if (error || !data) return null;

      return {
        lat: parseFloat(data.current_location_lat?.toString() || '0'),
        lng: parseFloat(data.current_location_lng?.toString() || '0')
      };
    } catch (error) {
      console.error('Error tracking technician location:', error);
      return null;
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        serviceRequests,
        availableTechnicians,
        createServiceRequest,
        acceptServiceRequest,
        cancelServiceRequest,
        completeServiceRequest,
        getRequestsForTechnician,
        getRequestsForClient,
        getTechniciansByServiceType,
        findNearbyTechnicians,
        currentRequest,
        setCurrentRequest,
        refreshRequests,
        autoAssignTechnician,
        trackTechnicianLocation,
        onlineTechnicians: onlineTechnicians,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
