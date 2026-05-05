import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, LayoutDashboard, ChevronRight } from 'lucide-react';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === 'user') {
      navigate('/login?role=user');
    } else if (selectedRole === 'admin') {
      navigate('/login?role=admin');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-deep-dark via-dark-bg to-deep-dark text-text-primary px-6 py-16 fade-in-animation">
      <div className="w-full max-w-md flex flex-col h-full space-y-10">
        
        <div className="text-center space-y-3 mt-4">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            Welcome to UrbanVolt
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Choose Role</h1>
          <p className="text-text-secondary text-base">Select how you want to use the platform</p>
        </div>

        <div className="grid gap-6">
          <div 
            onClick={() => setSelectedRole(prev => prev === 'user' ? null : 'user')}
            className={`relative overflow-hidden p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 transform active:scale-95 border flex items-center space-x-5 ${
              selectedRole === 'user' 
                ? 'border-primary/60 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-primary/5 scale-[1.02]' 
                : 'border-glass-border hover:border-white/10 bg-white/[0.02] grayscale opacity-70'
            }`}
          >
            {selectedRole === 'user' && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
            )}
            
            <div className={`relative p-4 rounded-2xl transition-all duration-500 ${selectedRole === 'user' ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white/5 text-text-secondary'}`}>
              <CarFront className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-1 transition-colors ${selectedRole === 'user' ? 'text-white' : 'text-text-secondary'}`}>EV User</h3>
              <p className="text-text-secondary text-sm opacity-60">Find optimal charging stations</p>
            </div>
            {selectedRole === 'user' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
          </div>

          <div 
            onClick={() => setSelectedRole(prev => prev === 'admin' ? null : 'admin')}
            className={`relative overflow-hidden p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 transform active:scale-95 border flex items-center space-x-5 ${
              selectedRole === 'admin' 
                ? 'border-accent/60 shadow-[0_0_30px_rgba(20,184,166,0.3)] bg-accent/5 scale-[1.02]' 
                : 'border-glass-border hover:border-white/10 bg-white/[0.02] grayscale opacity-70'
            }`}
          >
            {selectedRole === 'admin' && (
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none"></div>
            )}
            
            <div className={`relative p-4 rounded-2xl transition-all duration-500 ${selectedRole === 'admin' ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-white/5 text-text-secondary'}`}>
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-1 transition-colors ${selectedRole === 'admin' ? 'text-white' : 'text-text-secondary'}`}>Admin (BESCOM)</h3>
              <p className="text-text-secondary text-sm opacity-60">Monitor and manage infrastructure</p>
            </div>
            {selectedRole === 'admin' && <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>}
          </div>
        </div>

        <div className="flex-1"></div>

        <div className={`transition-all duration-500 ease-in-out ${selectedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <button 
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-2xl py-4 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95"
            onClick={handleContinue}
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
