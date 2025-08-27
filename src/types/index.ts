
export type UserType = 'client' | 'technician';

export type ServiceType = 'electrician' | 'mechanic' | 'plumber';

export interface User {
  id: string;
  name: string;
  phone: string;
  age?: number;
  type: UserType;
  personalId?: string;
  profileImage?: string;
  serviceType?: ServiceType;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  serviceType: ServiceType;
  description: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'audio' | 'none';
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  paymentMethod?: 'cash' | 'online';
  technicianId?: string;
  createdAt: Date;
  isVisitRequired: boolean;
}

export interface Technician extends User {
  serviceType: ServiceType;
  description: string;
  rating: number;
}
