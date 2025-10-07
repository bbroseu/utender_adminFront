import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface Region {
  id: number;
  name: string;
  created_by?: number;
  create_date?: number;
  updated_by?: number;
  update_date?: number;
  update_no?: number;
}

export interface CreateRegionData {
  name: string;
}

export interface UpdateRegionData {
  name?: string;
}

class RegionsService {
  async getAll(): Promise<Region[]> {
    try {
      const response = await api.get(API_ENDPOINTS.REGIONS.GET_ALL);
      console.log('Regions API Response:', response.data);
      
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
      console.error('Error fetching regions:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Region> {
    try {
      const response = await api.get(API_ENDPOINTS.REGIONS.GET_BY_ID(id));
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching region ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateRegionData): Promise<Region> {
    try {
      console.log('Sending region data to backend:', data);
      const response = await api.post(API_ENDPOINTS.REGIONS.CREATE, data);
      console.log('Create region API response:', response.data);
      const createdRegion = response.data.success ? response.data.data : response.data;
      
      if (!createdRegion || !createdRegion.id) {
        console.warn('Created region missing ID or is null, but region might still be created:', createdRegion);
        console.warn('Full response for debugging:', response.data);
        // Return a temporary region object - the list refresh will show the real data
        return { id: 0, name: data.name } as Region;
      }
      
      return createdRegion;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateRegionData): Promise<Region> {
    try {
      console.log('Updating region with ID:', id, 'Data:', data);
      if (!id || id === undefined) {
        throw new Error('Region ID is required for update');
      }
      const response = await api.put(API_ENDPOINTS.REGIONS.UPDATE(id), data);
      const updatedRegion = response.data.success ? response.data.data : response.data;
      return updatedRegion;
    } catch (error) {
      console.error(`Error updating region ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.REGIONS.DELETE(id));
    } catch (error) {
      console.error(`Error deleting region ${id}:`, error);
      throw error;
    }
  }
}

export default new RegionsService();