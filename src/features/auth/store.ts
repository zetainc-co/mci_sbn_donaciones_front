import { create } from 'zustand';
import { authService, type User, type LoginRequest, type RegisterRequest } from '@/shared/lib/api';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const initialState = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, error: null });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(data);
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al registrarse';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ ...initialState });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.me();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      authService.clearToken();
      set({ ...initialState });
    }
  },

  initializeAuth: async () => {
    if (authService.isAuthenticated()) {
      authService.initializeAuth();
      await useAuthStore.getState().fetchCurrentUser();
    }
  },
}));
