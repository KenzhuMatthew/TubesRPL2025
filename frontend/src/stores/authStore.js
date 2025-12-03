// stores/authStore.js (FIXED - Without Ant Design message)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth.api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          
          // ✅ FIX: Pastikan ambil dari response.data bukan response
          const data = response.data || response;
          const { user, accessToken } = data;

          // ✅ Validasi token
          if (!accessToken) {
            throw new Error('Token tidak ditemukan dalam response');
          }

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Success message will be shown by Login component
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Login gagal';
          set({
            loading: false,
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Register
      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register(data);
          
          set({
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          console.error('Register error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Registrasi gagal';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Get current user
      getCurrentUser: async () => {
        const { token } = get();
        
        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return { success: false };
        }

        try {
          const response = await authAPI.getCurrentUser();
          const userData = response.data || response;
          
          set({
            user: userData,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (error) {
          console.error('Get current user error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return { success: false };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set user
      setUser: (user) => set({ user, isAuthenticated: true }),

      // Set token
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);