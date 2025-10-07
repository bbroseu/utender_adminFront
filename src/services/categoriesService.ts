import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface Category {
  id: number;
  name: string;
  parent_id: number;
  created_by?: string;
  create_date?: number;
  updated_by?: string;
  update_date?: number;
  update_no?: number;
  is_root?: boolean;
  has_children?: boolean;
  children_count?: number;
  level?: number;
  full_path?: string;
  children?: Category[];
  // For frontend compatibility with existing structure
  description?: string;
  code?: string;
  parentCategory?: string | null;
  isActive?: boolean;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name?: string;
}

class CategoriesService {
  async getAll(): Promise<Category[]> {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      console.log('Categories API Response:', response.data);
      
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
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Category> {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
      const data = response.data.success ? response.data.data : response.data;
      return this.transformCategoryToFrontendFormat(data);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateCategoryData): Promise<Category> {
    try {
      const backendData = this.transformToBackendFormat(data);
      console.log('Sending category data to backend:', backendData); // Debug log
      const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, backendData);
      console.log('Full API response:', response); // Debug full response
      console.log('Response data:', response.data); // Debug response data
      console.log('Response status:', response.status); // Debug status
      
      const createdCategory = response.data.success ? response.data.data : response.data;
      console.log('Parsed created category:', createdCategory); // Debug parsed category
      
      if (!createdCategory || !createdCategory.id) {
        console.warn('Created category missing ID or is null, but category might still be created:', createdCategory);
        console.warn('Full response for debugging:', response.data);
        // Return a temporary category object - the list refresh will show the real data
        return { id: 0, name: data.name, parent_id: 0 } as Category;
      }
      
      return this.transformCategoryToFrontendFormat(createdCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateCategoryData): Promise<Category> {
    try {
      console.log('Updating category with ID:', id, 'Data:', data);
      if (!id || id === undefined) {
        throw new Error('Category ID is required for update');
      }
      const backendData = this.transformToBackendFormat(data);
      const response = await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), backendData);
      const updatedCategory = response.data.success ? response.data.data : response.data;
      return this.transformCategoryToFrontendFormat(updatedCategory);
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }

  async searchByName(searchTerm: string): Promise<Category[]> {
    try {
      const response = await api.get(`/categories/search?search=${encodeURIComponent(searchTerm)}`);
      const data = response.data.success && Array.isArray(response.data.data) ? response.data.data : [];
      return this.transformToFrontendFormat(data);
    } catch (error) {
      console.error(`Error searching categories by name "${searchTerm}":`, error);
      throw error;
    }
  }

  async getRootCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/categories/roots');
      const data = response.data.success && Array.isArray(response.data.data) ? response.data.data : [];
      return this.transformToFrontendFormat(data);
    } catch (error) {
      console.error('Error fetching root categories:', error);
      throw error;
    }
  }

  // Transform backend Category format to frontend format
  private transformCategoryToFrontendFormat(backendCategory: any): Category {
    const parentCategory = backendCategory.parent_id > 0 ? 'Parent Category' : null;
    
    return {
      id: backendCategory.id,
      name: backendCategory.name,
      parent_id: backendCategory.parent_id || 0,
      created_by: backendCategory.created_by,
      create_date: backendCategory.create_date,
      updated_by: backendCategory.updated_by,
      update_date: backendCategory.update_date,
      update_no: backendCategory.update_no,
      is_root: backendCategory.is_root || backendCategory.parent_id === 0,
      has_children: backendCategory.has_children || false,
      children_count: backendCategory.children_count || 0,
      level: backendCategory.level || 0,
      full_path: backendCategory.full_path || backendCategory.name,
      children: backendCategory.children || [],
      // Frontend compatibility fields
      description: backendCategory.description || '',
      code: backendCategory.code || backendCategory.name.substring(0, 4).toUpperCase(),
      parentCategory: parentCategory,
      isActive: backendCategory.isActive !== false, // Default to true
    };
  }

  private transformToFrontendFormat(backendCategories: any[]): Category[] {
    return backendCategories.map(category => this.transformCategoryToFrontendFormat(category));
  }

  // Transform frontend data to backend format
  private transformToBackendFormat(frontendData: CreateCategoryData | UpdateCategoryData): any {
    return {
      name: frontendData.name,
      // parent_id will default to 0 in the backend model
      // created_by will be set by the controller
    };
  }
}

export default new CategoriesService();