
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // This would be replaced with an actual API call
          // Simulation for frontend development
          await new Promise(res => setTimeout(res, 800));
          
          // Mock successful login
          set({ 
            isAuthenticated: true, 
            user: { 
              id: 1, 
              email, 
              createdAt: new Date().toISOString(),
              hasGeneratedKeys: false
            },
            token: 'mock-jwt-token',
            isLoading: false,
            error: null
          });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion.'
          });
          return false;
        }
      },
      
      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // This would be replaced with an actual API call
          await new Promise(res => setTimeout(res, 1000));
          
          // Mock successful registration
          set({
            isAuthenticated: true,
            user: { 
              id: 1, 
              email, 
              createdAt: new Date().toISOString(),
              hasGeneratedKeys: false
            },
            token: 'mock-jwt-token',
            isLoading: false,
            error: null
          });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription.'
          });
          return false;
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null 
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
