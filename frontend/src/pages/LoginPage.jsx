import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Phone, Mail, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { apiService } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'user';

  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // User form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone'); // phone or otp
  const otpRefs = useRef([]);

  // Admin form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Common state
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(30);

  // Validations
  const isValidPhone = phone.replace(/\D/g, '').length === 10;
  const isOtpComplete = otp.every(digit => digit !== '');
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 6;

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleUserLogin = async (e) => {
    e.preventDefault();
    if (step === 'phone') {
      if (!isValidPhone) {
        setErrorMsg('Invalid phone number');
        return;
      }
      setErrorMsg('');
      setLoading(true);
      try {
        await apiService.sendUserOtp({ phone_number: phone });
        setStep('otp');
        setTimer(30);
      } catch (err) {
        if (!err.response) {
          setErrorMsg('Backend Server is OFFLINE. Please start it in a new terminal.');
        } else {
          setErrorMsg(err.response?.data?.detail || 'Failed to send OTP.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!isOtpComplete) {
        setErrorMsg('Please enter all 6 digits');
        return;
      }
      const otpString = otp.join('');
      setErrorMsg('');
      setLoading(true);
      try {
        await useAuthStore.getState().verifyOtp(phone, otpString);
        navigate('/user');
      } catch (err) {
        if (!err.response) {
          setErrorMsg('Backend Server is OFFLINE. Please start it in a new terminal.');
        } else {
          setErrorMsg(err.response?.data?.detail || 'Invalid or expired OTP');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail || !isValidPassword) {
      setErrorMsg('Invalid credentials');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/admin');
    } catch (err) {
      setErrorMsg('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-dark-bg to-deep-dark text-text-primary px-4 fade-in-animation overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col h-full py-12">
        {/* Top bar with back button */}
        <div className="flex items-center mb-10">
          <button 
            onClick={() => navigate('/role-selection')}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Login</h2>
          <p className="text-text-secondary text-sm">
            {role === 'admin' ? 'Secure admin access' : 'Enter your phone number'}
          </p>
        </div>

        <div className={`w-full bg-dark-card/40 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border ${errorMsg ? 'border-error animate-shake' : 'border-glass-border'}`}>
          {errorMsg && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error text-sm rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {role === 'user' ? (
            <form onSubmit={handleUserLogin} className="space-y-6">
              {step === 'phone' ? (
                <div className="space-y-2">
                  <div className={`flex items-center bg-dark-bg border ${errorMsg ? 'border-error' : 'border-glass-border focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(59,130,246,0.3)]'} rounded-2xl overflow-hidden transition-all duration-300`}>
                    <div className="flex items-center pl-4 pr-3 border-r border-glass-border">
                      <Phone className="w-5 h-5 text-text-secondary mr-2" />
                      <span className="text-white font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-4 bg-transparent focus:outline-none text-white tracking-wide placeholder-gray-600"
                      maxLength={10}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 fade-in-animation">
                  <p className="text-center text-sm text-text-secondary">
                    OTP sent to <span className="text-white font-medium">+91 {phone}</span>
                  </p>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className={`w-12 h-14 bg-dark-bg border ${errorMsg ? 'border-error' : 'border-glass-border focus:border-primary focus:shadow-[0_0_10px_rgba(59,130,246,0.3)]'} rounded-xl text-center text-xl font-bold text-white transition-all focus:outline-none`}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    {timer > 0 ? (
                      <span className="text-sm text-text-secondary">Resend OTP in {timer}s</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => setTimer(30)}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || (step === 'phone' ? !isValidPhone : !isOtpComplete)}
                className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-accent text-white rounded-2xl py-4 text-lg font-bold transition-all ${
                  (loading || (step === 'phone' ? !isValidPhone : !isOtpComplete)) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-primary/90 hover:to-accent/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95'
                }`}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>{step === 'phone' ? 'Continue' : 'Verify OTP'}</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-4">
                <div className={`flex items-center bg-dark-bg border ${errorMsg ? 'border-error' : 'border-glass-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(20,184,166,0.3)]'} rounded-2xl overflow-hidden transition-all duration-300`}>
                  <div className="pl-4 pr-2">
                    <Mail className="w-5 h-5 text-text-secondary" />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@bescom.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2 py-4 bg-transparent focus:outline-none text-white placeholder-gray-600"
                  />
                </div>
                
                <div className={`flex items-center bg-dark-bg border ${errorMsg ? 'border-error' : 'border-glass-border focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(20,184,166,0.3)]'} rounded-2xl overflow-hidden transition-all duration-300`}>
                  <div className="pl-4 pr-2">
                    <Lock className="w-5 h-5 text-text-secondary" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-2 py-4 bg-transparent focus:outline-none text-white placeholder-gray-600"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !isValidEmail || !isValidPassword}
                className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-accent to-primary text-white rounded-2xl py-4 text-lg font-bold transition-all ${
                  (loading || !isValidEmail || !isValidPassword) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-accent/90 hover:to-primary/90 shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-95'
                }`}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Login to Dashboard</span>}
              </button>
            </form>
          )}
          {/* Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-glass-border">
            <p className="text-xs text-text-secondary mb-3 uppercase tracking-widest font-semibold opacity-50 text-center">
              Demo Credentials
            </p>
            <div className="grid gap-3">
              <button 
                onClick={() => {
                  if (role === 'admin') {
                    setEmail('admin@urbanvolt.ai');
                    setPassword('Admin@123');
                  } else {
                    setPhone('9876543210');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center group"
              >
                <span className="text-xs font-bold text-primary group-hover:text-primary/80">
                  {role === 'admin' ? 'Fill Admin Demo' : 'Fill User Demo'}
                </span>
                <span className="text-[10px] text-text-secondary mt-1">
                  {role === 'admin' ? 'admin@urbanvolt.ai | Admin@123' : 'Any 10-digit number'}
                </span>
              </button>
              
              {role === 'user' && step === 'otp' && (
                <div className="text-[10px] text-center text-text-secondary opacity-60">
                  Note: In DEBUG mode, any 6-digit OTP will work.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
