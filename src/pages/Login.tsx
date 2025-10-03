
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { setUserType } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'client' | 'technician' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  console.log('[Login] render');

  const handleSelection = (type: 'client' | 'technician') => {
    setIsAnimating(true);
    setSelectedType(type);
    
    setTimeout(() => {
      setUserType(type);
      navigate(`/auth/${type}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className={`max-w-md w-full space-y-8 p-8 bg-neutral-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-800 transition-all ${isAnimating ? 'scale-95 opacity-50' : ''}`}>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-primary">EFIX</h1>
            <p className="mt-2 text-neutral-400">Professional services at your fingertips</p>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-medium text-center mb-6 text-white">I am a...</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleSelection('client')}
                className={`group relative p-6 border-2 rounded-xl transition-all ${selectedType === 'client' ? 'border-primary bg-primary/10' : 'border-neutral-700 hover:border-primary'}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white">Client</h3>
                  <p className="text-center text-neutral-400 mt-2">I need a service</p>
                </div>
              </button>
              
              <button
                onClick={() => handleSelection('technician')}
                className={`group relative p-6 border-2 rounded-xl transition-all ${selectedType === 'technician' ? 'border-primary bg-primary/10' : 'border-neutral-700 hover:border-primary'}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white">Technician</h3>
                  <p className="text-center text-neutral-400 mt-2">I provide a service</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
