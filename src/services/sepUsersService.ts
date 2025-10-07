import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface SepUser {
  id: number;
  username: string;
  register_date?: number;
  register_date_formatted?: string;
  expire_date?: number;
  expire_date_formatted?: string;
  status: number;
  email: string;
  active?: number;
  group?: number;
  name?: string;
  phone_number?: string;
  phone?: string; // Alternative field name
  company?: string;
  fiscal_number?: string;
  contact?: string;
  package?: string;
  age_seconds?: number;
  days_until_expiry?: number | null;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  is_active?: boolean;
  is_inactive?: boolean;
  has_valid_status?: boolean;
  has_group?: boolean;
  recently_registered?: boolean;
  account_status?: string;
  is_username_short?: boolean;
  is_username_long?: boolean;
  is_password_weak?: boolean;
  // New fields from backend object
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  reference_company?: string | null;
  valid_time?: number | null;
  image?: string | null;
  company_id?: number | null;
  language?: string | null;
  state_tenders_id?: number;
  created_by?: string;
  create_date?: number;
  updated_by?: string;
  update_date?: number;
  update_no?: number | null;
  sec_email?: string | null;
  pako?: string | null;
  "3_email"?: string | null;
  "4_email"?: string | null;
  p_kontaktues?: string | null;
  flag?: string | null;
  full_name?: string;
  create_date_formatted?: string;
  update_date_formatted?: string;
  valid_time_formatted?: string | null;
  is_valid_time_expired?: boolean;
  status_text?: string;
  language_text?: string;
  is_suspended?: boolean;
  is_pending?: boolean;
  is_banned?: boolean;
  has_image?: boolean;
  last_updated_age_seconds?: number;
  all_emails?: Array<{
    type: string;
    email: string;
  }>;
}

export interface SepUserSearchParams {
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  status?: number;
  active?: number;
  group?: number;
}

export interface SepUsersResponse {
  data: SepUser[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

class SepUsersService {
  async getAll(params: SepUserSearchParams = {}): Promise<SepUser[]> {
    try {
      const searchParams = new URLSearchParams();
      
      // Set default pagination - use page-based pagination only
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      searchParams.append('limit', limit.toString());
      searchParams.append('page', page.toString());
      
      // Add other search parameters
      if (params.search) searchParams.append('search', params.search);
      if (params.status !== undefined) searchParams.append('status', params.status.toString());
      if (params.active !== undefined) searchParams.append('active', params.active.toString());
      if (params.group !== undefined) searchParams.append('group', params.group.toString());
      
      const url = `${API_ENDPOINTS.SEP_USERS.GET_ALL}?${searchParams.toString()}`;
      console.log('Fetching sep users from:', url);
      
      const response = await api.get(url);
      console.log('Sep Users API Response:', response.data);
      
      // Handle the backend response format
      if (response.data && response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching sep users:', error);
      throw error;
    }
  }

  async getPaginated(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<SepUser>> {
    try {
      const params: any = { page, limit };
      if (search) {
        params.search = search;
      }
      
      const response = await api.get(API_ENDPOINTS.SEP_USERS.GET_ALL, { params });
      console.log('SEP Users Paginated API Response:', response.data);
      
      // Handle the backend response format
      if (response.data && response.data.success) {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        return {
          data,
          total: response.data.pagination?.total || response.data.total || data.length,
          totalPages: response.data.pagination?.totalPages || response.data.totalPages || Math.ceil((response.data.total || data.length) / limit),
          currentPage: response.data.pagination?.currentPage || response.data.currentPage || page
        };
      } else if (Array.isArray(response.data)) {
        // Fallback for simple array response
        const data = response.data;
        return {
          data,
          total: data.length,
          totalPages: Math.ceil(data.length / limit),
          currentPage: page
        };
      } else {
        console.warn('Unexpected response format:', response.data);
        return {
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: page
        };
      }
    } catch (error) {
      console.error('Error fetching paginated sep users:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<SepUser> {
    try {
      const response = await api.get(API_ENDPOINTS.SEP_USERS.GET_BY_ID(id));
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching sep user ${id}:`, error);
      throw error;
    }
  }

  async create(userData: Partial<SepUser>): Promise<SepUser> {
    try {
      const response = await api.post(API_ENDPOINTS.SEP_USERS.CREATE, userData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error creating sep user:', error);
      throw error;
    }
  }

  async update(id: number, userData: Partial<SepUser>): Promise<SepUser> {
    try {
      const response = await api.put(API_ENDPOINTS.SEP_USERS.UPDATE(id), userData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating sep user ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.SEP_USERS.DELETE(id));
    } catch (error) {
      console.error(`Error deleting sep user ${id}:`, error);
      throw error;
    }
  }

  async updateStatus(id: number, status: number): Promise<SepUser> {
    try {
      const response = await api.patch(API_ENDPOINTS.SEP_USERS.UPDATE_STATUS(id), { status });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating status for sep user ${id}:`, error);
      throw error;
    }
  }

  async updateActive(id: number, active: number): Promise<SepUser> {
    try {
      const response = await api.patch(API_ENDPOINTS.SEP_USERS.UPDATE_ACTIVE(id), { active });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating active status for sep user ${id}:`, error);
      throw error;
    }
  }

  async activate(id: number): Promise<SepUser> {
    try {
      const response = await api.put(API_ENDPOINTS.SEP_USERS.ACTIVATE(id));
      console.log('Activate member API response:', response.data);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error activating sep user ${id}:`, error);
      throw error;
    }
  }

  async changePassword(id: number, newPassword: string): Promise<void> {
    try {
      await api.patch(API_ENDPOINTS.SEP_USERS.CHANGE_PASSWORD(id), { password: newPassword });
    } catch (error) {
      console.error(`Error changing password for sep user ${id}:`, error);
      throw error;
    }
  }

  async extendExpiry(id: number, days: number): Promise<SepUser> {
    try {
      const response = await api.put(API_ENDPOINTS.SEP_USERS.EXTEND_EXPIRY(id), { days: days });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error extending expiry for sep user ${id}:`, error);
      throw error;
    }
  }

  // Filter methods
  async getActive(params: { limit?: number; page?: number } = {}): Promise<SepUser[]> {
    try {
      const searchParams = new URLSearchParams();
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      searchParams.append('limit', limit.toString());
      searchParams.append('page', page.toString());
      
      const url = `${API_ENDPOINTS.SEP_USERS.FILTER_ACTIVE}?${searchParams.toString()}`;
      console.log('Fetching active sep users from:', url);
      
      const response = await api.get(url);
      console.log('Active SEP Users API Response:', response.data);
      
      if (response.data && response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching active sep users:', error);
      throw error;
    }
  }

  async getInactive(): Promise<SepUser[]> {
    try {
      const response = await api.get(API_ENDPOINTS.SEP_USERS.FILTER_INACTIVE);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching inactive sep users:', error);
      throw error;
    }
  }

  async getByStatus(status: number, params: { limit?: number; page?: number } = {}): Promise<SepUser[]> {
    try {
      const searchParams = new URLSearchParams();
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      searchParams.append('limit', limit.toString());
      searchParams.append('page', page.toString());
      
      const url = `${API_ENDPOINTS.SEP_USERS.FILTER_BY_STATUS(status)}?${searchParams.toString()}`;
      console.log('Fetching sep users by status from:', url);
      
      const response = await api.get(url);
      console.log('SEP Users by Status API Response:', response.data);
      
      if (response.data && response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching sep users with status ${status}:`, error);
      throw error;
    }
  }

  async getByStatusPaginated(status: number, page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<SepUser>> {
    try {
      const params: any = { page, limit };
      if (search) {
        params.search = search;
      }
      
      const response = await api.get(API_ENDPOINTS.SEP_USERS.FILTER_BY_STATUS(status), { params });
      console.log('SEP Users by Status Paginated API Response:', response.data);
      
      // Handle the backend response format
      if (response.data && response.data.success) {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        return {
          data,
          total: response.data.pagination?.total || response.data.total || data.length,
          totalPages: response.data.pagination?.totalPages || response.data.totalPages || Math.ceil((response.data.total || data.length) / limit),
          currentPage: response.data.pagination?.currentPage || response.data.currentPage || page
        };
      } else if (Array.isArray(response.data)) {
        // Fallback for simple array response
        const data = response.data;
        return {
          data,
          total: data.length,
          totalPages: Math.ceil(data.length / limit),
          currentPage: page
        };
      } else {
        console.warn('Unexpected response format:', response.data);
        return {
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: page
        };
      }
    } catch (error) {
      console.error(`Error fetching paginated sep users with status ${status}:`, error);
      throw error;
    }
  }

  async getExpired(params: { limit?: number; page?: number } = {}): Promise<SepUser[]> {
    try {
      const searchParams = new URLSearchParams();
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      searchParams.append('limit', limit.toString());
      searchParams.append('page', page.toString());
      
      const url = `${API_ENDPOINTS.SEP_USERS.FILTER_EXPIRED}?${searchParams.toString()}`;
      console.log('Fetching expired sep users from:', url);
      
      const response = await api.get(url);
      console.log('Expired SEP Users API Response:', response.data);
      
      if (response.data && response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching expired sep users:', error);
      throw error;
    }
  }

  async getStats(): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.SEP_USERS.STATS);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching sep users stats:', error);
      throw error;
    }
  }
}

export default new SepUsersService();