
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useService } from '@/context/ServiceContext';
import RoleSwitcher from '@/components/RoleSwitcher';
import MenuSidebar from '@/components/MenuSidebar';
import { Menu } from 'lucide-react';

const ClientHome = () => {
  const { user, signOut } = useAuth();
  const { getRequestsForClient } = useService();
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const requests = getRequestsForClient(user.id);
      const active = requests.filter(r => r.status === 'pending' || r.status === 'accepted').length;
      setActiveRequests(active);
    }
  }, [user, getRequestsForClient]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} userType="client" />
      
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

      {/* Hero Section */}
      <section className="bg-neutral-900 pt-20 pb-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hi, {user?.name || 'there'}! 
            </h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto">
              Professional repair services at your fingertips. 
              What do you need help with today?
            </p>
          </div>
          
          {/* Services Illustration */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-lg">
              <div className="relative z-0 grid grid-cols-3 gap-4 p-4 bg-neutral-800 rounded-xl shadow-lg border border-neutral-700">
                <div className="flex flex-col items-center p-4 bg-neutral-900 rounded-lg">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Electrical</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-neutral-900 rounded-lg">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Mechanical</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-neutral-900 rounded-lg">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Plumbing</span>
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
      <section className="py-16 px-4 bg-neutral-900">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Your Services</h2>
            
            <div className="bg-neutral-800 rounded-lg shadow-md p-6 mb-6 border border-neutral-700">
              {activeRequests > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-white">You have {activeRequests} active service request{activeRequests !== 1 ? 's' : ''}</p>
                    <p className="text-neutral-400">Check their status or track your technician</p>
                  </div>
                  <Link to="/client/requests">
                    <Button variant="outline" className="border-neutral-600 text-white hover:bg-neutral-700">View Requests</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-neutral-400 mb-4">You don't have any active service requests</p>
                  <Link to="/client/services">
                    <Button>Book Your First Service</Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-neutral-800 rounded-lg shadow-md p-6 border border-neutral-700">
              <h3 className="text-xl font-medium mb-4 text-white">Need emergency assistance?</h3>
              <p className="text-neutral-400 mb-4">
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
      <section className="py-16 bg-black border-t border-neutral-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-white">Why Choose <span className="text-primary">EFIX</span>?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 p-6 rounded-lg shadow-md border border-neutral-800">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">Quick Response</h3>
              <p className="text-neutral-400">
                Get connected with skilled technicians within minutes, right when you need help.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-lg shadow-md border border-neutral-800">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">Verified Professionals</h3>
              <p className="text-neutral-400">
                All our technicians are thoroughly vetted and qualified in their respective fields.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-lg shadow-md border border-neutral-800">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">Secure Payments</h3>
              <p className="text-neutral-400">
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
