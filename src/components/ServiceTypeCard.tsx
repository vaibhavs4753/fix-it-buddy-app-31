
import { Link } from 'react-router-dom';
import { ServiceType } from '@/types';
import { cn } from '@/lib/utils';
import ServiceIcon from './ServiceIcon';

interface ServiceTypeCardProps {
  serviceType: ServiceType;
  onClick?: () => void;
  className?: string;
  linkTo?: string;
}

const ServiceTypeCard = ({ serviceType, onClick, className, linkTo }: ServiceTypeCardProps) => {
  const title = {
    'electrician': 'Electrician',
    'mechanic': 'Mechanic',
    'plumber': 'Plumber',
  }[serviceType];

  const description = {
    'electrician': 'Electrical repairs, installations, and maintenance',
    'mechanic': 'Vehicle repairs, diagnostics, and maintenance',
    'plumber': 'Plumbing repairs, installations, and maintenance',
  }[serviceType];

  const bgColor = {
    'electrician': 'bg-white hover:bg-white',
    'mechanic': 'bg-white hover:bg-white',
    'plumber': 'bg-white hover:bg-white',
  }[serviceType];

  const card = (
    <div 
      className={cn(
        "p-6 rounded-lg shadow-md transition-all", 
        bgColor,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-white mr-4">
          <ServiceIcon type={serviceType} size={32} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-black">{description}</p>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {card}
      </Link>
    );
  }

  return card;
};

export default ServiceTypeCard;
