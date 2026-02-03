/**
 * Auth Service - Authentication API endpoints
 */
import { api } from '../client';
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from '../types';

const TOKEN_KEY = 'mci_auth_token';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } finally {
      this.clearToken();
    }
  },

  /**
   * Get current authenticated user
   */
  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Set auth token in localStorage and API client
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    api.setAuthToken(token);
  },

  /**
   * Clear auth token
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    api.setAuthToken(null);
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Initialize auth from stored token
   */
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      api.setAuthToken(token);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
