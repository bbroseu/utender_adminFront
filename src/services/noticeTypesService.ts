import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface NoticeType {
  id: number;
  notice?: string; // Legacy field, keeping for compatibility
  name: string; // Primary name field from API
  created_by?: string;
  create_date?: number;
  updated_by?: string;
  update_date?: number;
  update_no?: number;
}

export interface CreateNoticeTypeData {
  notice: string;
}

export interface UpdateNoticeTypeData {
  notice?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

class NoticeTypesService {
  async getAll(): Promise<NoticeType[]> {
    try {
      const response = await api.get(API_ENDPOINTS.NOTICE_TYPES.GET_ALL);
      console.log('Notice Types API Response:', response.data);
      
      // Handle the backend response format: { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return this.transformToFrontendFormat(response.data.data);
      } else if (Array.isArray(response.data)) {
        return this.transformToFrontendFormat(response.data);
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching notice types:', error);
      throw error;
    }
  }

  async getPaginated(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<NoticeType>> {
    try {
      const params: any = { page, limit };
      if (search) {
        params.search = search;
      }
      
      const response = await api.get(API_ENDPOINTS.NOTICE_TYPES.GET_ALL, { params });
      console.log('Notice Types Paginated API Response:', response.data);
      
      // Handle the backend response format
      if (response.data && response.data.success) {
        const data = this.transformToFrontendFormat(response.data.data || []);
        return {
          data,
          total: response.data.pagination?.total || response.data.total || data.length,
          totalPages: response.data.pagination?.totalPages || response.data.totalPages || Math.ceil((response.data.total || data.length) / limit),
          currentPage: response.data.pagination?.currentPage || response.data.currentPage || page
        };
      } else if (Array.isArray(response.data)) {
        // Fallback for simple array response
        const data = this.transformToFrontendFormat(response.data);
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
      console.error('Error fetching paginated notice types:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<NoticeType> {
    try {
      const response = await api.get(API_ENDPOINTS.NOTICE_TYPES.GET_BY_ID(id));
      const data = response.data.success ? response.data.data : response.data;
      return this.transformNoticeTypeToFrontendFormat(data);
    } catch (error) {
      console.error(`Error fetching notice type ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateNoticeTypeData): Promise<NoticeType> {
    try {
      console.log('Sending notice type data to backend:', data);
      const response = await api.post(API_ENDPOINTS.NOTICE_TYPES.CREATE, data);
      console.log('Create notice type API response:', response.data);
      const createdNoticeType = response.data.success ? response.data.data : response.data;
      
      if (!createdNoticeType || !createdNoticeType.id) {
        console.warn('Created notice type missing ID or is null, but notice type might still be created:', createdNoticeType);
        console.warn('Full response for debugging:', response.data);
        // Return a temporary notice type object - the list refresh will show the real data
        return { id: 0, notice: data.notice, name: data.notice } as NoticeType;
      }
      
      return this.transformNoticeTypeToFrontendFormat(createdNoticeType);
    } catch (error) {
      console.error('Error creating notice type:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateNoticeTypeData): Promise<NoticeType> {
    try {
      console.log('Updating notice type with ID:', id, 'Data:', data);
      if (!id || id === undefined) {
        throw new Error('Notice Type ID is required for update');
      }
      const response = await api.put(API_ENDPOINTS.NOTICE_TYPES.UPDATE(id), data);
      const updatedNoticeType = response.data.success ? response.data.data : response.data;
      return this.transformNoticeTypeToFrontendFormat(updatedNoticeType);
    } catch (error) {
      console.error(`Error updating notice type ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.NOTICE_TYPES.DELETE(id));
    } catch (error) {
      console.error(`Error deleting notice type ${id}:`, error);
      throw error;
    }
  }

  // Transform backend NoticeType format to frontend format
  private transformNoticeTypeToFrontendFormat(backendNoticeType: any): NoticeType {
    return {
      id: backendNoticeType.id,
      notice: backendNoticeType.notice || backendNoticeType.name,
      created_by: backendNoticeType.created_by,
      create_date: backendNoticeType.create_date,
      updated_by: backendNoticeType.updated_by,
      update_date: backendNoticeType.update_date,
      update_no: backendNoticeType.update_no,
      // Frontend compatibility - use name field from API response or fallback to notice
      name: backendNoticeType.name || backendNoticeType.notice,
    };
  }

  private transformToFrontendFormat(backendNoticeTypes: any[]): NoticeType[] {
    return backendNoticeTypes.map(noticeType => this.transformNoticeTypeToFrontendFormat(noticeType));
  }
}

export default new NoticeTypesService();