
import { Link } from 'react-router-dom';
import ServiceTypeCard from '@/components/ServiceTypeCard';
import Footer from '@/components/Footer';

const ClientServices = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/client/home" 
              className="flex items-center text-primary hover:underline mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Book a Service</h1>
            <p className="text-gray-600">
              Select the type of service you need
            </p>
          </div>
          
          <div className="space-y-6">
            <ServiceTypeCard 
              serviceType="electrician"
              linkTo="/client/booking/electrician"
              className="transform transition-all hover:scale-[1.02] hover:shadow-lg"
            />
            
            <ServiceTypeCard 
              serviceType="mechanic"
              linkTo="/client/booking/mechanic"
              className="transform transition-all hover:scale-[1.02] hover:shadow-lg"
            />
            
            <ServiceTypeCard 
              serviceType="plumber"
              linkTo="/client/booking/plumber"
              className="transform transition-all hover:scale-[1.02] hover:shadow-lg"
            />
          </div>
          
          <div className="mt-10 bg-primary/10 p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Not sure which service you need?</h3>
            <p className="text-gray-600 mb-4">
              Describe your problem and we'll help match you with the right professional.
            </p>
            <Link to="/client/booking/general">
              <button className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-50 border border-primary/30">
                General Assistance
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClientServices;
