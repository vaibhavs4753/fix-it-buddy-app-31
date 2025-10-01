
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Wrench, Droplet } from 'lucide-react';
import Footer from '@/components/Footer';

const ClientServices = () => {
  const services = [
    {
      id: 'electrician',
      icon: Zap,
      label: 'Electrician',
      color: 'bg-amber-500',
      path: '/client/booking/electrician',
    },
    {
      id: 'mechanic',
      icon: Wrench,
      label: 'Mechanic',
      color: 'bg-primary',
      path: '/client/booking/mechanic',
    },
    {
      id: 'plumber',
      icon: Droplet,
      label: 'Plumber',
      color: 'bg-blue-500',
      path: '/client/booking/plumber',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/client/home" 
              className="flex items-center text-neutral-400 hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to home
            </Link>
            
            <h1 className="text-3xl font-bold mb-2 text-white">Choose a</h1>
            <h2 className="text-3xl font-bold text-white mb-4">Service for you</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.id}
                  to={service.path}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-20 h-20 ${service.color} rounded-2xl flex items-center justify-center mb-3 transform transition-all group-hover:scale-110 group-hover:shadow-lg`}>
                    <Icon className="text-black" size={32} strokeWidth={2.5} />
                  </div>
                  <span className="text-white text-sm font-medium">{service.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 bg-neutral-800 p-6 rounded-xl border border-neutral-700">
            <h3 className="font-medium text-lg mb-2 text-white">History</h3>
            <p className="text-neutral-400 text-sm">
              View your past service requests and bookings
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClientServices;
