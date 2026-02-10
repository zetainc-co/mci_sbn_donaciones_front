import { api } from "../client";

export interface UserProfile {
  id: number;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  city: string | null;
  status: string;
  membership_type: string | null;
  ministerio: string | null;
  campus_name: string | null;
  last_synced_at: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  planning_center_id: string | null;
  source: string;
  created_at: string;
  profile: UserProfile | null;
  roles: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
}

export interface UsersListResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SyncStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  pending_users: number;
  recently_synced: number;
  needs_sync: number;
  last_sync: string | null;
  planning_center_linked: number;
  manual_users: number;
}

export interface SyncResult {
  processed: number;
  created: number;
  updated: number;
  merged: number;
  skipped: number;
  errors: number;
}

// Lookup response type
export interface UserLookupResult {
  exists: boolean;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone?: string;
    phone_masked?: string;
    document_type?: string;
    document_number?: string;
    has_account: boolean;
  };
}

export const usersService = {
  /**
   * Lookup user by email or document (public endpoint)
   */
  async lookup(query: string, queryType: 'email' | 'document'): Promise<UserLookupResult> {
    const response = await api.post<UserLookupResult>('/users/lookup', {
      query,
      query_type: queryType,
    });
    return response.data;
  },

  /**
   * Get paginated list of users
   */
  async getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<UsersListResponse> {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const response = await api.get<User[]>(`/users${queryString}`);
    return { data: response.data, meta: response.meta! };
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<SyncStats> {
    const response = await api.get<SyncStats>("/users/sync/stats");
    return response.data;
  },

  /**
   * Trigger sync from Planning Center
   */
  async triggerSync(options?: { full?: boolean }): Promise<SyncResult> {
    const response = await api.post<SyncResult>("/users/sync", options);
    return response.data;
  },

  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleName: string): Promise<void> {
    await api.post(`/users/${userId}/roles`, { role: roleName });
  },

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleName: string): Promise<void> {
    await api.delete(`/users/${userId}/roles/${roleName}`);
  },
};
