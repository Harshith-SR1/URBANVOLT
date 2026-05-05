import { useEffect } from 'react';
import useAuthStore from '../stores/authStore';

const useAuth = () => {
  const { initializeAuth, ...authProps } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return authProps;
};

export default useAuth;
