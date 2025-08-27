
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useService } from '@/context/ServiceContext';

const ClientHome = () => {
  const { user } = useAuth();
  const { getRequestsForClient } = useService();
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    if (user) {
      const requests = getRequestsForClient(user.id);
      const active = requests.filter(r => r.status === 'pending' || r.status === 'accepted').length;
      setActiveRequests(active);
    }
  }, [user, getRequestsForClient]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-primary/5 pt-20 pb-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hi, {user?.name || 'there'}! 
            </h1>
            <p className="text-lg text-gray-700 max-w-xl mx-auto">
              Professional repair services at your fingertips. 
              What do you need help with today?
            </p>
          </div>
          
          {/* Services Illustration */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white opacity-30 z-10 rounded-xl"></div>
              <div className="relative z-0 grid grid-cols-3 gap-4 p-4 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Electrical</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Mechanical</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Plumbing</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link to="/client/services">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                Book a Service
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Active Requests Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Services</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {activeRequests > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium">You have {activeRequests} active service request{activeRequests !== 1 ? 's' : ''}</p>
                    <p className="text-gray-500">Check their status or track your technician</p>
                  </div>
                  <Link to="/client/requests">
                    <Button variant="outline">View Requests</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">You don't have any active service requests</p>
                  <Link to="/client/services">
                    <Button>Book Your First Service</Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-medium mb-4">Need emergency assistance?</h3>
              <p className="text-gray-600 mb-4">
                Our priority service connects you with available technicians as quickly as possible.
              </p>
              <Link to="/client/services">
                <Button variant="destructive">Emergency Service</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Why Choose FixIt Pro?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Quick Response</h3>
              <p className="text-gray-600">
                Get connected with skilled technicians within minutes, right when you need help.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Verified Professionals</h3>
              <p className="text-gray-600">
                All our technicians are thoroughly vetted and qualified in their respective fields.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Pay with confidence through our secure payment platform or use cash on completion.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ClientHome;
