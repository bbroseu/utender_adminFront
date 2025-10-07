import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface Procedure {
  id: number;
  name: string;
  description?: string;
  minDuration?: number;
  isActive?: boolean;
  created_by?: string;
  create_date?: number;
  updated_by?: string;
  update_date?: number;
  update_no?: number;
}

export interface CreateProcedureData {
  name: string;
  description?: string;
  minDuration?: number;
  isActive?: boolean;
}

export interface UpdateProcedureData {
  name?: string;
  description?: string;
  minDuration?: number;
  isActive?: boolean;
}

class ProceduresService {
  async getAll(): Promise<Procedure[]> {
    try {
      const response = await api.get(API_ENDPOINTS.PROCEDURES.GET_ALL);
      console.log('API Response:', response.data); // Debug log
      
      // Handle the backend response format: { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Procedure> {
    try {
      const response = await api.get(API_ENDPOINTS.PROCEDURES.GET_BY_ID(id));
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching procedure ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateProcedureData): Promise<Procedure> {
    try {
      const response = await api.post(API_ENDPOINTS.PROCEDURES.CREATE, data);
      console.log('Create API response:', response.data); // Debug log
      
      // Handle different possible response formats
      let createdProcedure;
      if (response.data.success && response.data.data) {
        createdProcedure = response.data.data;
      } else if (response.data.success && response.data.procedure) {
        createdProcedure = response.data.procedure;
      } else if (response.data.id) {
        createdProcedure = response.data;
      } else {
        // If no ID in response, create a temporary object for optimistic update
        console.warn('API response missing ID, using optimistic update');
        createdProcedure = {
          id: Date.now(), // Temporary ID
          ...data,
          created_by: 'admin',
          create_date: Math.floor(Date.now() / 1000)
        };
      }
      
      console.log('Processed created procedure:', createdProcedure);
      return createdProcedure;
    } catch (error) {
      console.error('Error creating procedure:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateProcedureData): Promise<Procedure> {
    try {
      console.log('API update called with ID:', id, 'Data:', data); // Debug log
      if (!id || id === undefined) {
        throw new Error('Procedure ID is required for update');
      }
      const response = await api.put(API_ENDPOINTS.PROCEDURES.UPDATE(id), data);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating procedure ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.PROCEDURES.DELETE(id));
    } catch (error) {
      console.error(`Error deleting procedure ${id}:`, error);
      throw error;
    }
  }

  async searchByName(searchTerm: string): Promise<Procedure[]> {
    try {
      const response = await api.get(`/procedures/search/${searchTerm}`);
      return response.data.success && Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error(`Error searching procedures by name "${searchTerm}":`, error);
      throw error;
    }
  }
}

export default new ProceduresService();