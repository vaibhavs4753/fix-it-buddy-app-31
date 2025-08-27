
import { ServiceType } from '@/types';
import { Wrench, Plug, Settings } from 'lucide-react';

interface ServiceIconProps {
  type: ServiceType;
  size?: number;
  className?: string;
}

const ServiceIcon = ({ type, size = 24, className }: ServiceIconProps) => {
  switch (type) {
    case 'electrician':
      return <Plug size={size} className={className} />;
    case 'mechanic':
      return <Settings size={size} className={className} />;
    case 'plumber':
      return <Wrench size={size} className={className} />;
    default:
      return null;
  }
};

export default ServiceIcon;
