/**
 * Causes Service - Donation causes API endpoints
 */
import { api } from '../client';
import type { Cause, CauseType } from '../types';

export const causesService = {
  /**
   * Get all active causes
   * @param type - Optional filter by cause type (MOTIVE, PROJECT, EVENT)
   */
  async getAll(type?: CauseType): Promise<Cause[]> {
    const endpoint = type ? `/causes?type=${type}` : '/causes';
    const response = await api.get<Cause[]>(endpoint);
    return response.data;
  },

  /**
   * Get a single cause by ID
   */
  async getById(causeId: string): Promise<Cause> {
    const response = await api.get<Cause>(`/causes/${causeId}`);
    return response.data;
  },

  /**
   * Get causes by type
   */
  async getMotives(): Promise<Cause[]> {
    return this.getAll('MOTIVE');
  },

  async getProjects(): Promise<Cause[]> {
    return this.getAll('PROJECT');
  },

  async getEvents(): Promise<Cause[]> {
    return this.getAll('EVENT');
  },
};
