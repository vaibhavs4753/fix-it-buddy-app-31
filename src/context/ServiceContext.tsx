
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ServiceRequest, ServiceType } from '../types';
import { useToast } from '@/hooks/use-toast';

interface ServiceContextType {
  serviceRequests: ServiceRequest[];
  createServiceRequest: (request: Partial<ServiceRequest>) => Promise<ServiceRequest>;
  acceptServiceRequest: (requestId: string, technicianId: string) => Promise<void>;
  cancelServiceRequest: (requestId: string) => Promise<void>;
  completeServiceRequest: (requestId: string, personalId: string) => Promise<boolean>;
  getRequestsForTechnician: (serviceType: ServiceType) => ServiceRequest[];
  getRequestsForClient: (clientId: string) => ServiceRequest[];
  currentRequest: ServiceRequest | null;
  setCurrentRequest: (request: ServiceRequest | null) => void;
  nearby: { lat: number; lng: number; distance: number }[];
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);
  const [nearby] = useState([
    { lat: 40.7128, lng: -74.006, distance: 0.5 },
    { lat: 40.7135, lng: -74.004, distance: 0.8 },
    { lat: 40.7120, lng: -74.010, distance: 1.2 },
  ]);
  const { toast } = useToast();

  const createServiceRequest = async (request: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      clientId: request.clientId || '',
      serviceType: request.serviceType || 'electrician',
      description: request.description || '',
      mediaUrls: request.mediaUrls || [],
      mediaType: request.mediaType || 'none',
      status: 'pending',
      location: request.location || { lat: 0, lng: 0, address: '' },
      createdAt: new Date(),
      isVisitRequired: request.isVisitRequired || false,
    };

    setServiceRequests(prev => [...prev, newRequest]);
    toast({
      title: "Service Request Created",
      description: "Your service request has been created successfully."
    });
    return newRequest;
  };

  const acceptServiceRequest = async (requestId: string, technicianId: string) => {
    setServiceRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'accepted', technicianId } 
          : request
      )
    );
    
    toast({
      title: "Service Request Accepted",
      description: "You have successfully accepted the service request."
    });
  };

  const cancelServiceRequest = async (requestId: string) => {
    setServiceRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'cancelled' } 
          : request
      )
    );
    
    toast({
      title: "Service Request Cancelled",
      description: "The service request has been cancelled."
    });
  };

  const completeServiceRequest = async (requestId: string, personalId: string): Promise<boolean> => {
    // In a real app, we would validate the personal ID
    // Here we just accept any value for demo purposes
    if (personalId) {
      setServiceRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'completed' } 
            : request
        )
      );
      
      toast({
        title: "Service Completed",
        description: "Thank you for completing the service!"
      });
      return true;
    }
    
    toast({
      title: "Invalid Personal ID",
      description: "The personal ID you entered is incorrect.",
      variant: "destructive"
    });
    return false;
  };

  const getRequestsForTechnician = (serviceType: ServiceType): ServiceRequest[] => {
    return serviceRequests.filter(
      request => request.serviceType === serviceType && request.status === 'pending'
    );
  };

  const getRequestsForClient = (clientId: string): ServiceRequest[] => {
    return serviceRequests.filter(request => request.clientId === clientId);
  };

  return (
    <ServiceContext.Provider
      value={{
        serviceRequests,
        createServiceRequest,
        acceptServiceRequest,
        cancelServiceRequest,
        completeServiceRequest,
        getRequestsForTechnician,
        getRequestsForClient,
        currentRequest,
        setCurrentRequest,
        nearby,
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
