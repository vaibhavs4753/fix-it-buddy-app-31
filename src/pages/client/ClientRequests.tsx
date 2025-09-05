import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useService } from '@/context/ServiceContext';
import RoleSwitcher from '@/components/RoleSwitcher';
import ServiceRequestCard from '@/components/ServiceRequestCard';

const ClientRequests = () => {
  const { user, signOut } = useAuth();
  const { getRequestsForClient } = useService();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const userRequests = getRequestsForClient(user.id);
      setRequests(userRequests);
    }
  }, [user, getRequestsForClient]);

  const handleLogout = async () => {
    await signOut();
  };

  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'accepted');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">FixIt Pro</h1>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <Button variant="outline" onClick={handleLogout}>
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
              <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
              <p className="text-gray-600 mt-2">Track and manage your service requests</p>
            </div>
            <Link to="/client/services">
              <Button>Book New Service</Button>
            </Link>
          </div>

          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Active Requests 
                <Badge variant="secondary">{activeRequests.length}</Badge>
              </h2>
              <div className="space-y-4">
                {activeRequests.map((request) => (
                  <ServiceRequestCard 
                    key={request.id} 
                    request={request}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Requests */}
          {completedRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Completed Requests
                <Badge variant="outline">{completedRequests.length}</Badge>
              </h2>
              <div className="space-y-4">
                {completedRequests.map((request) => (
                  <ServiceRequestCard 
                    key={request.id} 
                    request={request}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Requests */}
          {requests.length === 0 && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
              <p className="text-gray-500 mb-4">
                When you book a service, your requests will appear here.
              </p>
              <Link to="/client/services">
                <Button>Book Your First Service</Button>
              </Link>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/client/services">
                  <Button variant="outline">Book New Service</Button>
                </Link>
                <Link to="/client/home">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientRequests;