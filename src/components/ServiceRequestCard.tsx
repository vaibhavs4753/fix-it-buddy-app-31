
import { ServiceRequest } from '@/types';
import { Button } from '@/components/ui/button';
import ServiceIcon from './ServiceIcon';
import { CalendarClock } from 'lucide-react';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onAccept?: () => void;
  onCancel?: () => void;
  onView?: () => void;
  showActions?: boolean;
}

const ServiceRequestCard = ({ 
  request, 
  onAccept, 
  onCancel, 
  onView,
  showActions = true 
}: ServiceRequestCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="p-2 rounded-full bg-blue-100 mr-3">
          <ServiceIcon type={request.serviceType} size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-lg capitalize">{request.serviceType} Service</h3>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarClock size={14} className="mr-1" />
            {formatDate(new Date(request.createdAt))}
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 mb-3 line-clamp-2">{request.description}</p>
      
      <div className="text-sm text-gray-600 mb-3">
        <p className="truncate">
          Location: {request.location.address || 'Unknown location'}
        </p>
        <p>
          Type: {request.isVisitRequired ? 'Visit Required' : 'Remote Help Possible'}
        </p>
      </div>
      
      {showActions && (
        <div className="flex flex-wrap gap-2">
          {onView && (
            <Button onClick={onView} variant="outline" size="sm">
              View Details
            </Button>
          )}
          
          {onAccept && (
            <Button onClick={onAccept} variant="default" size="sm">
              Accept
            </Button>
          )}
          
          {onCancel && (
            <Button onClick={onCancel} variant="destructive" size="sm">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceRequestCard;
