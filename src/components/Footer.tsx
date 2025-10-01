
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="bg-neutral-900 py-8 mt-auto border-t border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-2xl mb-4 text-primary">EFIX</h3>
            <p className="text-neutral-400">
              Professional services for all your electrical, mechanical, and plumbing needs.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-neutral-400 hover:text-primary transition-colors">Electrician</Link></li>
              <li><Link to="/services" className="text-neutral-400 hover:text-primary transition-colors">Mechanic</Link></li>
              <li><Link to="/services" className="text-neutral-400 hover:text-primary transition-colors">Plumber</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-neutral-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} <span className="font-bold text-primary">EFIX</span>. All rights reserved.
          </p>
          
          {user?.type === 'technician' ? (
            <Link to="/technician/home" className="text-neutral-400 hover:text-primary transition-colors text-sm">
              Technician Dashboard
            </Link>
          ) : (
            <Link to="/client/home" className="text-neutral-400 hover:text-primary transition-colors text-sm">
              Client Dashboard
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
