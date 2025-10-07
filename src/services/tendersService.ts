import api from '../lib/api';
import { API_ENDPOINTS } from '../store/api/endpoints';

export interface Tender {
  id: number;
  title: string;
  procurement_number?: string;
  publication_date: string;
  expiry_date: string;
  retendering?: boolean;
  folder?: string;
  file?: string;
  file_2?: string;
  file_3?: string;
  file_4?: string;
  file_5?: string;
  contract_type_id?: number;
  category_id?: number;
  procedures_id?: number;
  notice_type_id?: number;
  region_id?: number;
  states_id?: number;
  contracting_authority_id?: number;
  description?: string;
  flag?: number;
  created_by?: string;
  create_date?: number;
  updated_by?: string;
  update_date?: number;
  update_no?: number;
  email?: string;
  cmimi?: number;
  // Related data that might be populated by joins
  contracting_authority?: {
    id: number;
    name: string;
  };
  notice_type?: {
    id: number;
    notice: string;
  };
  category?: {
    id: number;
    name: string;
  };
  region?: {
    id: number;
    name: string;
  };
  // API response includes these as direct properties
  contracting_authority_name?: string;
  category_name?: string;
  contract_type_name?: string;
  procedure_name?: string;
  notice_type_name?: string;
  region_name?: string;
  state_name?: string;
}

export interface TenderSearchParams {
  limit?: number;
  page?: number;
  value?: string;
  notice_type_id?: number;
  contracting_authority_id?: number;
  category_id?: number;
  region_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface TendersResponse {
  data: Tender[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

class TendersService {
  async getAll(params: TenderSearchParams = {}): Promise<TendersResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      // Set default pagination
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      searchParams.append('limit', limit.toString());
      searchParams.append('page', page.toString());
      
      // Add other search parameters
      if (params.value) searchParams.append('value', params.value);
      if (params.notice_type_id) searchParams.append('notice_type_id', params.notice_type_id.toString());
      if (params.contracting_authority_id) searchParams.append('contracting_authority_id', params.contracting_authority_id.toString());
      if (params.category_id) searchParams.append('category_id', params.category_id.toString());
      if (params.region_id) searchParams.append('region_id', params.region_id.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.date_from) searchParams.append('date_from', params.date_from);
      if (params.date_to) searchParams.append('date_to', params.date_to);
      
      const url = `${API_ENDPOINTS.TENDERS.GET_ALL}?${searchParams.toString()}`;
      console.log('Fetching tenders from:', url);
      
      const response = await api.get(url);
      console.log('Tenders API Response:', response.data);
      
      // Handle the backend response format
      if (response.data && response.data.success) {
        const { data, pagination } = response.data;
        return {
          data: Array.isArray(data) ? data : [],
          total: pagination?.total || 0,
          page: pagination?.page || page,
          totalPages: pagination?.totalPages || 0,
          limit: pagination?.limit || limit,
        };
      } else if (Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          totalPages: 1,
          limit: response.data.length,
        };
      } else {
        console.warn('Unexpected response format:', response.data);
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: 10,
        };
      }
    } catch (error) {
      console.error('Error fetching tenders:', error);
      throw error;
    }
  }

  async getByCreatedBy(createdBy: string, params: TenderSearchParams = {}): Promise<TendersResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      // Set default pagination
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      searchParams.append('limit', limit.toString());
      searchParams.append('page', page.toString());
      
      // Add search parameter if provided
      if (params.value) searchParams.append('value', params.value);
      
      const url = `/tenders/created-by/${createdBy}?${searchParams.toString()}`;
      console.log('Fetching tenders by creator from:', url);
      
      const response = await api.get(url);
      console.log('Tenders by creator API Response:', response.data);
      
      // Handle the backend response format
      if (response.data && response.data.success) {
        const { data, pagination } = response.data;
        const dataArray = Array.isArray(data) ? data : [];
        const currentLimit = pagination?.limit || limit;
        
        // Calculate total and totalPages based on data length and current page
        // If we get fewer items than the limit, we're on the last page
        const isLastPage = dataArray.length < currentLimit;
        const currentPage = pagination?.page || page;
        
        // Estimate total based on whether this is the last page
        let estimatedTotal = 0;
        let totalPages = 1;
        
        if (isLastPage) {
          // If this is the last page, calculate total
          estimatedTotal = ((currentPage - 1) * currentLimit) + dataArray.length;
          totalPages = currentPage;
        } else {
          // If not the last page, we know there are more items
          // Set a high estimate to ensure pagination shows
          estimatedTotal = currentPage * currentLimit + 1;
          totalPages = currentPage + 1;
        }
        
        return {
          data: dataArray,
          total: pagination?.total || estimatedTotal,
          page: currentPage,
          totalPages: pagination?.totalPages || totalPages,
          limit: currentLimit,
        };
      } else if (Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          totalPages: 1,
          limit: response.data.length,
        };
      } else {
        console.warn('Unexpected response format:', response.data);
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: 10,
        };
      }
    } catch (error) {
      console.error(`Error fetching tenders by creator ${createdBy}:`, error);
      throw error;
    }
  }

  async getById(id: number): Promise<Tender> {
    try {
      const response = await api.get(API_ENDPOINTS.TENDERS.GET_BY_ID(id));
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching tender ${id}:`, error);
      throw error;
    }
  }

  async deleteTender(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.TENDERS.DELETE(id));
    } catch (error) {
      console.error(`Error deleting tender ${id}:`, error);
      throw error;
    }
  }

  async updateTender(id: number, tenderData: Partial<Tender>): Promise<Tender> {
    try {
      const response = await api.put(API_ENDPOINTS.TENDERS.UPDATE(id), tenderData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating tender ${id}:`, error);
      throw error;
    }
  }

  async downloadFile(id: number, filename: string): Promise<void> {
    try {
      const response = await api.get(API_ENDPOINTS.TENDERS.DOWNLOAD_FILE(id, filename), {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link?.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading file ${filename}:`, error);
      throw error;
    }
  }

  // Helper method to get tender documents
  getTenderDocuments(tender: Tender): Array<{ name: string; url: string; field: string }> {
    const documents: Array<{ name: string; url: string; field: string }> = [];
    
    if (tender.file) {
      documents.push({
        name: tender.file.split('/').pop() || 'Document 1',
        url: API_ENDPOINTS.TENDERS.DOWNLOAD_FILE(tender.id, tender.file),
        field: 'file'
      });
    }
    
    if (tender.file_2) {
      documents.push({
        name: tender.file_2.split('/').pop() || 'Document 2',
        url: API_ENDPOINTS.TENDERS.DOWNLOAD_FILE(tender.id, tender.file_2),
        field: 'file_2'
      });
    }
    
    if (tender.file_3) {
      documents.push({
        name: tender.file_3.split('/').pop() || 'Document 3',
        url: API_ENDPOINTS.TENDERS.DOWNLOAD_FILE(tender.id, tender.file_3),
        field: 'file_3'
      });
    }
    
    if (tender.file_4) {
      documents.push({
        name: tender.file_4.split('/').pop() || 'Document 4',
        url: API_ENDPOINTS.TENDERS.DOWNLOAD_FILE(tender.id, tender.file_4),
        field: 'file_4'
      });
    }
    
    if (tender.file_5) {
      documents.push({
        name: tender.file_5.split('/').pop() || 'Document 5',
        url: API_ENDPOINTS.TENDERS.DOWNLOAD_FILE(tender.id, tender.file_5),
        field: 'file_5'
      });
    }
    
    return documents;
  }

  // Helper method to check if tender is expired
  isTenderExpired(tender: Tender): boolean {
    if (!tender.expiry_date) return false;
    return new Date(tender.expiry_date) < new Date();
  }

  // Helper method to format dates
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}

export default new TendersService();