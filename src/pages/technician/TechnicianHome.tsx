
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceRequestCard from '@/components/ServiceRequestCard';
import { useAuth } from '@/context/AuthContext';
import { useService } from '@/context/ServiceContext';
import { ServiceRequest } from '@/types';
import TechnicianLocationTracker from '@/components/TechnicianLocationTracker';
import Footer from '@/components/Footer';
import RoleSwitcher from '@/components/RoleSwitcher';
import MenuSidebar from '@/components/MenuSidebar';
import { Menu } from 'lucide-react';

const TechnicianHome = () => {
  const { user, signOut } = useAuth();
  const { getRequestsForTechnician, acceptServiceRequest, cancelServiceRequest, setCurrentRequest } = useService();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    if (user?.serviceType) {
      const serviceRequests = getRequestsForTechnician(user.serviceType);
      setRequests(serviceRequests);
    }
  }, [user, getRequestsForTechnician]);
  
  const handleAccept = async (request: ServiceRequest) => {
    if (user) {
      await acceptServiceRequest(request.id);
      setCurrentRequest(request);
      navigate('/technician/tracking');
    }
  };
  
  const handleCancel = async (request: ServiceRequest) => {
    await cancelServiceRequest(request.id);
    if (user?.serviceType) {
      const updatedRequests = getRequestsForTechnician(user.serviceType);
      setRequests(updatedRequests);
    }
  };
  
  const handleView = (request: ServiceRequest) => {
    setCurrentRequest(request);
    navigate('/technician/service-details');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} userType="technician" />
      
      {/* Header */}
      <header className="bg-black shadow-lg border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-neutral-300" />
            </button>
            <h1 className="text-2xl font-bold text-primary">EFIX</h1>
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <Button variant="outline" onClick={handleLogout} className="border-neutral-700 text-white hover:bg-neutral-800">
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Header with status toggle */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Service Requests</h1>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-neutral-400">Status:</span>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${isOnline ? 'bg-primary' : 'bg-neutral-700'}`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-black rounded-full ${isOnline ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
              <span className="ml-2 text-sm font-medium text-white">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Welcome Card */}
          <div className="bg-neutral-800 rounded-lg p-6 mb-8 shadow-sm border border-neutral-700">
            <div className="flex items-start">
              <div className="mr-4">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-medium text-white">Welcome, {user?.name || 'Technician'}</h2>
                <p className="text-neutral-400">Service: <span className="font-medium capitalize text-primary">{user?.serviceType}</span></p>
                
                <div className="mt-2">
                  <p className="text-sm text-neutral-400">ID: <span className="font-mono">{user?.personalId || 'N/A'}</span></p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Location Tracking */}
          <TechnicianLocationTracker 
            isActive={isOnline}
            onStatusChange={setIsOnline}
          />
          
          {/* Requests Section */}
          {isOnline ? (
            <>
              <h2 className="text-xl font-medium mb-4 text-white">New Requests</h2>
              
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <ServiceRequestCard
                      key={request.id}
                      request={request}
                      onAccept={() => handleAccept(request)}
                      onCancel={() => handleCancel(request)}
                      onView={() => handleView(request)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-800 rounded-lg shadow-md p-8 text-center border border-neutral-700">
                  <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">No new requests</h3>
                  <p className="text-neutral-400 mb-4">
                    You'll be notified when new service requests come in
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Refresh requests - in a real app this would poll the server
                      if (user?.serviceType) {
                        const serviceRequests = getRequestsForTechnician(user.serviceType);
                        setRequests(serviceRequests);
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              )}
              
              <div className="mt-8 bg-neutral-800 rounded-lg shadow-md p-6 border border-neutral-700">
                <h2 className="text-lg font-medium mb-2 text-white">Tips for Better Service</h2>
                <ul className="text-neutral-400 space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Always confirm your arrival time with clients
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Keep your tools and equipment ready at all times
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Check service details thoroughly before accepting
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-neutral-800 rounded-lg shadow-md p-8 text-center border border-neutral-700">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">You're currently offline</h3>
              <p className="text-neutral-400 mb-4">
                Toggle your status to online to receive new service requests
              </p>
              <Button onClick={() => setIsOnline(true)}>
                Go Online
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TechnicianHome;
