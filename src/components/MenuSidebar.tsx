import { Link } from 'react-router-dom';
import { X, HelpCircle, CreditCard, History, Settings } from 'lucide-react';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'client' | 'technician';
}

const MenuSidebar = ({ isOpen, onClose, userType }: MenuSidebarProps) => {
  const menuItems = [
    { icon: HelpCircle, label: 'Help', path: '#' },
    { icon: CreditCard, label: 'Payment', path: '#' },
    { icon: History, label: 'History', path: `/${userType}/requests` },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-neutral-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-primary">Menu</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3 text-white hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MenuSidebar;
