import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BatteryCharging, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between text-text-primary fade-in-animation overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/ev_charging_bg.png')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-deep-dark/60 via-deep-dark/80 to-deep-dark backdrop-blur-[2px]" />

      {/* Content Top */}
      <div className="relative z-10 pt-20 pb-8 flex flex-col items-center w-full px-6">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            URBANVOLT
          </h1>
        </div>
        <p className="text-text-secondary font-medium tracking-wide text-sm uppercase">Smart EV Charging Assistant</p>
      </div>

      {/* Content Center - Glowing Icon */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></div>
          <div className="absolute inset-4 rounded-full border border-accent/40 animate-spin-slow opacity-40"></div>
          <div className="w-20 h-20 bg-dark-card/50 backdrop-blur-md rounded-full flex items-center justify-center border border-glass-border shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-glow">
            <BatteryCharging className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Content Bottom - Button */}
      <div className="relative z-10 pb-16 px-6 w-full max-w-sm mx-auto">
        <div className="bg-dark-card/30 backdrop-blur-xl border border-glass-border p-6 rounded-[2rem] shadow-2xl">
          <p className="text-center text-text-secondary text-sm mb-6">
            Find the optimal charging stations and monitor infrastructure seamlessly.
          </p>
          <button 
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-2xl py-4 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95"
            onClick={() => navigate('/role-selection')}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
