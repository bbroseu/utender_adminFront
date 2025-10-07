import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface ContractingAuthority {
  id: number;
  name: string;
  created_by?: string;
  create_date?: number;
  updated_by?: string;
  update_date?: number;
  update_no?: number;
}

class ContractingAuthoritiesService {
  async getAll(): Promise<ContractingAuthority[]> {
    try {
      const response = await api.get(API_ENDPOINTS.CONTRACTING_AUTHORITIES.GET_ALL);
      console.log('Contracting Authorities API Response:', response.data);
      
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
      console.error('Error fetching contracting authorities:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<ContractingAuthority> {
    try {
      const response = await api.get(API_ENDPOINTS.CONTRACTING_AUTHORITIES.GET_BY_ID(id));
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching contracting authority ${id}:`, error);
      throw error;
    }
  }
}

export default new ContractingAuthoritiesService();