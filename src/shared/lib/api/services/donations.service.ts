/**
 * Donations Service - Donation management API endpoints
 */
import { api } from '../client';
import type {
  Donation,
  CreateDonationRequest,
  CreateDonationResponse,
  PaginatedResponse,
  PaymentStatus,
} from '../types';

export interface GetDonationsParams {
  page?: number;
  per_page?: number;
  status?: PaymentStatus;
}

export const donationsService = {
  /**
   * Create a new donation
   * Works for both authenticated users and guests
   */
  async create(data: CreateDonationRequest): Promise<CreateDonationResponse> {
    const response = await api.post<CreateDonationResponse>('/donations', data);
    return response.data;
  },

  /**
   * Get user's donation history (requires authentication)
   */
  async getAll(params?: GetDonationsParams): Promise<PaginatedResponse<Donation>> {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.set('page', params.page.toString());
    }
    if (params?.per_page) {
      searchParams.set('per_page', params.per_page.toString());
    }
    if (params?.status) {
      searchParams.set('status', params.status);
    }

    const query = searchParams.toString();
    const endpoint = query ? `/donations?${query}` : '/donations';

    const response = await api.get<PaginatedResponse<Donation>>(endpoint);
    return response.data;
  },

  /**
   * Get a single donation by ID
   */
  async getById(donationId: string): Promise<Donation> {
    const response = await api.get<Donation>(`/donations/${donationId}`);
    return response.data;
  },

  /**
   * Download donation receipt (returns blob URL)
   */
  async downloadReceipt(donationId: string): Promise<string> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const url = `${baseUrl}/donations/${donationId}/receipt`;

    // Open in new tab for PDF download
    window.open(url, '_blank');
    return url;
  },
};
