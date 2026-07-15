import { create } from 'zustand';
import api from '@/lib/api';
import { useToastStore } from './toastStore';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: true,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    const currentToken = get().token;
    if (!currentToken) {
      set({ loading: false });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch (err: any) {
      console.error('Failed to load user profile', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      }
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      useToastStore.getState().addToast('Welcome back!', 'success');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: message, loading: false });
      useToastStore.getState().addToast(message, 'error');
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      useToastStore.getState().addToast('Account created successfully!', 'success');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message, loading: false });
      useToastStore.getState().addToast(message, 'error');
      return false;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/auth/profile', profileData);
      set({ user: response.data, loading: false });
      useToastStore.getState().addToast('Profile updated', 'success');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Profile update failed.';
      set({ error: message, loading: false });
      useToastStore.getState().addToast(message, 'error');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null })
}));
export default useAuthStore;
