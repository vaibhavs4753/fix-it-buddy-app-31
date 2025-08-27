
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="bg-gray-100 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">FixIt Pro</h3>
            <p className="text-gray-600">
              Professional services for all your electrical, mechanical, and plumbing needs.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-600 hover:underline">Electrician</Link></li>
              <li><Link to="/services" className="text-gray-600 hover:underline">Mechanic</Link></li>
              <li><Link to="/services" className="text-gray-600 hover:underline">Plumber</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:underline">About Us</Link></li>
              <li><Link to="/" className="text-gray-600 hover:underline">Contact</Link></li>
              <li><Link to="/" className="text-gray-600 hover:underline">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:underline">Terms of Service</Link></li>
              <li><Link to="/" className="text-gray-600 hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} FixIt Pro. All rights reserved.
          </p>
          
          {user?.type === 'technician' ? (
            <Link to="/technician/home" className="text-blue-600 hover:underline text-sm">
              Technician Dashboard
            </Link>
          ) : (
            <Link to="/client/home" className="text-blue-600 hover:underline text-sm">
              Client Dashboard
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
