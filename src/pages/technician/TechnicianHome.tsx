
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

const TechnicianHome = () => {
  const { user, signOut } = useAuth();
  const { getRequestsForTechnician, acceptServiceRequest, cancelServiceRequest, setCurrentRequest } = useService();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  
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
      navigate('/technician/service-details');
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-black">FixIt Pro</h1>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Header with status toggle */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Service Requests</h1>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm">Status:</span>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${isOnline ? 'bg-black' : 'bg-black'}`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${isOnline ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
              <span className="ml-2 text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-white to-white rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="mr-4">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-medium">Welcome, {user?.name || 'Technician'}</h2>
                <p className="text-black">Your service type: <span className="font-medium capitalize">{user?.serviceType}</span></p>
                
                <div className="mt-2">
                  <p className="text-sm">Personal ID: <span className="font-mono">{user?.personalId || 'N/A'}</span></p>
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
              <h2 className="text-xl font-medium mb-4">New Requests</h2>
              
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
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No new requests</h3>
                  <p className="text-black mb-4">
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
              
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium mb-2">Tips for Better Service</h2>
                <ul className="text-black space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Always confirm your arrival time with clients
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Keep your tools and equipment ready at all times
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Check service details thoroughly before accepting
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">You're currently offline</h3>
              <p className="text-black mb-4">
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
