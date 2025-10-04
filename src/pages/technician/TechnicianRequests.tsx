import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useService } from '@/context/ServiceContext';
import RoleSwitcher from '@/components/RoleSwitcher';
import ServiceRequestCard from '@/components/ServiceRequestCard';
import { ServiceRequest } from '@/types';

const TechnicianRequests = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { serviceRequests, setCurrentRequest } = useService();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    if (user?.id) {
      const technicianRequests = serviceRequests.filter(
        req => req.technicianId === user.id
      );
      setRequests(technicianRequests);
    }
  }, [user, serviceRequests]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewDetails = (request: ServiceRequest) => {
    setCurrentRequest(request);
    navigate('/technician/service-details');
  };

  const activeRequests = requests.filter(r => r.status === 'accepted');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      {/* Header */}
      <header className="bg-black shadow-lg border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">EFIX</h1>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <Button variant="outline" onClick={handleLogout} className="border-neutral-700 text-white hover:bg-neutral-800">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">My Service History</h1>
              <p className="text-neutral-400 mt-2">View your active and completed services</p>
            </div>
            <Link to="/technician/home">
              <Button className="bg-primary text-black hover:bg-primary/90">Back to Dashboard</Button>
            </Link>
          </div>

          {/* Active Services */}
          {activeRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                Active Services
                <Badge className="bg-primary/20 text-primary">{activeRequests.length}</Badge>
              </h2>
              <div className="space-y-4">
                {activeRequests.map((request) => (
                  <ServiceRequestCard 
                    key={request.id} 
                    request={request}
                    onView={() => handleViewDetails(request)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Services */}
          {completedRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                Completed Services
                <Badge className="border-neutral-600 text-neutral-300">{completedRequests.length}</Badge>
              </h2>
              <div className="space-y-4">
                {completedRequests.map((request) => (
                  <ServiceRequestCard 
                    key={request.id} 
                    request={request}
                    onView={() => handleViewDetails(request)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Requests */}
          {requests.length === 0 && (
            <Card className="p-8 text-center bg-neutral-800 border-neutral-700">
              <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No service history yet</h3>
              <p className="text-neutral-400 mb-4">
                When you accept and complete services, they will appear here.
              </p>
              <Link to="/technician/home">
                <Button className="bg-primary text-black hover:bg-primary/90">View Available Requests</Button>
              </Link>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="p-6 bg-neutral-800 border-neutral-700">
              <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/technician/home">
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-700">View New Requests</Button>
                </Link>
                {activeRequests.length > 0 && (
                  <Link to="/technician/tracking">
                    <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-700">Active Tracking</Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechnicianRequests;
