import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
      loading: false,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.loginAdmin(credentials).catch(() => apiService.loginUserEmail(credentials));
          const { token, user, admin } = response.data;
          const access_token = token.access_token;
          const principal = user || admin;
          
          set({
            user: principal,
            token: access_token,
            isAuthenticated: true,
            isAdmin: principal.role === 'admin',
            loading: false,
          });
          localStorage.setItem('urbanvolt_token', access_token);
        } catch (error) {
          set({ error: error.response?.data?.detail || 'Login failed', loading: false });
          throw error;
        }
      },

      verifyOtp: async (phone_number, otp_code) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.verifyUserOtp({ phone_number, otp_code });
          const { token, user } = response.data;
          const access_token = token.access_token;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isAdmin: false,
            loading: false,
          });
          localStorage.setItem('urbanvolt_token', access_token);
        } catch (error) {
          set({ error: error.response?.data?.detail || 'Invalid OTP', loading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
        localStorage.removeItem('urbanvolt_token');
      },

      fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.getAuthMe();
          const user = response.data;
          set({
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            loading: false,
          });
        } catch (error) {
          get().logout();
          set({ loading: false });
        }
      },

      initializeAuth: () => {
        const token = localStorage.getItem('urbanvolt_token');
        if (token) {
          set({ token });
          get().fetchProfile();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
