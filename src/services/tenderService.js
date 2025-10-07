import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true' || false; // Disable mock mode by default

class TenderService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // For development, use a mock token if no real token exists
        const token = localStorage.getItem('authToken') || 'dev-mock-token';
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Create a new tender
  async createTender(tenderData) {
    if (MOCK_MODE) {
      // Mock implementation for development
      console.log('Mock: Creating tender with data:', tenderData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return {
        id: Math.floor(Math.random() * 1000),
        ...tenderData,
        created_at: new Date().toISOString(),
        status: 'created'
      };
    }

    try {
      const response = await this.axiosInstance.post('/tenders', tenderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload files for a tender
  async uploadFiles(files, tenderId = null) {
    if (MOCK_MODE) {
      // Mock implementation for development
      console.log('Mock: Uploading files:', files.map(f => f.name));
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload delay
      return {
        uploadedFiles: files.map((file, index) => ({
          id: index + 1,
          name: file.name,
          size: file.size,
          url: `mock://uploads/${file.name}`,
          fieldName: `file_${index + 1}`
        })),
        tenderId: tenderId || Math.floor(Math.random() * 1000)
      };
    }

    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`file_${index + 1}`, file);
      });

      if (tenderId) {
        formData.append('tenderId', tenderId);
      }

      const response = await this.axiosInstance.post('/tenders/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload and process tender document for auto-filling
  async uploadAndProcessDocument(file) {
    if (MOCK_MODE) {
      // Mock implementation for development
      console.log('Mock: Processing document:', file.name);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
      return {
        link: 'https://example.com/tender/123',
        title: 'Sample Tender - Construction Project',
        prosecutionNumber: 'TN-2024-001',
        category: 'Construction',
        subCategory: 'Commercial Buildings',
        contractType: 'Works',
        procedure: 'Open',
        noticeType: 'Contract Notice',
        country: 'Kosovo',
        region: 'Pristina',
        publicationDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        email: 'procurement@example.com',
        price: '150000.00',
        retendering: false,
        description: 'Sample description extracted from the uploaded document.',
        authorities: ['Ministry of Infrastructure', 'Municipality of Pristina']
      };
    }

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await this.axiosInstance.post('/tenders/process-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all tenders
  async getTenders(params = {}) {
    try {
      const response = await this.axiosInstance.get('/tenders', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tender by ID
  async getTenderById(id) {
    try {
      const response = await this.axiosInstance.get(`/tenders/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update tender
  async updateTender(id, tenderData) {
    try {
      const response = await this.axiosInstance.put(`/tenders/${id}`, tenderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete tender
  async deleteTender(id) {
    try {
      await this.axiosInstance.delete(`/tenders/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search tenders
  async searchTenders(searchTerm, searchField = 'title', params = {}) {
    try {
      const response = await this.axiosInstance.get('/tenders/search', {
        params: {
          term: searchTerm,
          field: searchField,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tenders by category
  async getTendersByCategory(categoryId, params = {}) {
    try {
      const response = await this.axiosInstance.get(`/tenders/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tenders by contracting authority
  async getTendersByAuthority(authorityId, params = {}) {
    try {
      const response = await this.axiosInstance.get(`/tenders/authority/${authorityId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get active tenders
  async getActiveTenders(params = {}) {
    try {
      const response = await this.axiosInstance.get('/tenders/active', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get expired tenders
  async getExpiredTenders(params = {}) {
    try {
      const response = await this.axiosInstance.get('/tenders/expired', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tenders expiring soon
  async getExpiringSoonTenders(days = 7, params = {}) {
    try {
      const response = await this.axiosInstance.get('/tenders/expiring-soon', {
        params: { days, ...params }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tender statistics
  async getTenderStats() {
    try {
      const response = await this.axiosInstance.get('/tenders/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Flag/unflag tender
  async updateTenderFlag(id, flag) {
    try {
      const response = await this.axiosInstance.patch(`/tenders/${id}/flag`, { flag });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tenders by date range
  async getTendersByDateRange(startDate, endDate, dateField = 'publication_date', params = {}) {
    try {
      const response = await this.axiosInstance.get('/tenders/date-range', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dateField,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to handle API errors
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Bad request. Please check your input.');
        case 401:
          return new Error('Unauthorized. Please login again.');
        case 403:
          return new Error('Access denied. You do not have permission to perform this action.');
        case 404:
          return new Error('Resource not found.');
        case 409:
          return new Error(data.message || 'Conflict. The resource already exists.');
        case 422:
          return new Error(data.message || 'Validation failed. Please check your input.');
        case 500:
          return new Error('Internal server error. Please try again later.');
        default:
          return new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('Network error. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Utility method to format tender data for submission
  formatTenderData(formData, selectedAuthorityIds, uploadedFiles, currentUser = null) {
    const tenderData = {
      title: formData.title?.trim() || null,
      procurement_number: formData.prosecutionNumber?.trim() || null,
      publication_date: formData.publicationDate ? Math.floor(formData.publicationDate.getTime() / 1000) : null,
      expiry_date: formData.endDate ? Math.floor(formData.endDate.getTime() / 1000) : null,
      description: formData.description?.trim() || null,
      notice_type_id: formData.noticeTypeId || null,
      category_id: formData.categoryId || null,
      procedures_id: formData.procedureId || null,
      contract_type_id: formData.contractTypeId || null,
      region_id: formData.regionId || null,
      states_id: formData.countryId || null,
      contracting_authority_id: selectedAuthorityIds.length > 0 ? selectedAuthorityIds[0] : null,
      cmimi: formData.price?.trim() || null,
      email: formData.email?.trim() || null,
      folder: null, // Set to null for now - backend expects tinyint
      created_by: this.getUserName(currentUser),
      updated_by: this.getUserName(currentUser),
      create_date: Math.floor(Date.now() / 1000),
      flag: 0,
      retendering: formData.retendering ? 1 : 0
    };

    // Add file references if files were uploaded
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, index) => {
        if (index < 5) { // Maximum 5 files supported
          tenderData[`file${index === 0 ? '' : `_${index + 1}`}`] = file.name;
        }
      });
    }

    return tenderData;
  }

  // Helper method to get user name for created_by/updated_by fields
  getUserName(user) {
    if (!user) return 'admin'; // Fallback for when user is not available
    
    // Try different name combinations
    if (user.name && user.surname) {
      return `${user.name} ${user.surname}`;
    }
    if (user.full_name) {
      return user.full_name;
    }
    if (user.name) {
      return user.name;
    }
    if (user.username) {
      return user.username;
    }
    
    return 'admin'; // Final fallback
  }

  // Helper method to format description with additional info
  formatDescription(formData, selectedAuthorities) {
    let formattedDescription = formData.description?.trim() || '';
    
    // Add dropdown selections to description
    const dropdownInfo = [];
    
    if (formData.category) dropdownInfo.push(`Category: ${formData.category}`);
    if (formData.subCategory) dropdownInfo.push(`Sub-Category: ${formData.subCategory}`);
    if (formData.contractType) dropdownInfo.push(`Contract Type: ${formData.contractType}`);
    if (formData.procedure) dropdownInfo.push(`Procedure: ${formData.procedure}`);
    if (formData.noticeType) dropdownInfo.push(`Notice Type: ${formData.noticeType}`);
    if (formData.country) dropdownInfo.push(`Country: ${formData.country}`);
    if (formData.region) dropdownInfo.push(`Region: ${formData.region}`);
    if (selectedAuthorities.length > 0) dropdownInfo.push(`Contracting Authorities: ${selectedAuthorities.join(', ')}`);
    
    if (dropdownInfo.length > 0) {
      if (formattedDescription) {
        formattedDescription += '\n\n--- Tender Details ---\n' + dropdownInfo.join('\n');
      } else {
        formattedDescription = '--- Tender Details ---\n' + dropdownInfo.join('\n');
      }
    }
    
    if (formData.link?.trim()) {
      formattedDescription += formattedDescription ? '\n\nSource Link: ' + formData.link.trim() : 'Source Link: ' + formData.link.trim();
    }
    
    return formattedDescription || null;
  }

  // Helper methods to map UI values to database IDs
  // These use fallback to ID 1 to avoid foreign key constraint issues
  getNoticeTypeId(noticeType) {
    // Notice type constraint has issues, return null for now
    // TODO: Fix notice_types table foreign key constraint
    return null;
  }

  getCategoryId(category) {
    const categoryMap = {
      'Construction': 1,
      'IT Services': 2,
      'Medical Equipment': 3,
      'Office Supplies': 4,
      'Consultancy': 5,
      'Supplies': 6
    };
    return categoryMap[category] || null;
  }

  getProcedureId(procedure) {
    const procedureMap = {
      'Open': 1,
      'Restricted': 2,
      'Negotiated': 3,
      'Competitive Dialogue': 4
    };
    return procedureMap[procedure] || null;
  }

  getContractTypeId(contractType) {
    const contractTypeMap = {
      'Works': 1,
      'Services': 2,
      'Supplies': 3,
      'Mixed': 4
    };
    return contractTypeMap[contractType] || null;
  }

  getRegionId(region) {
    const regionMap = {
      'Pristina': 1,
      'Mitrovica': 2,
      'Peja': 3,
      'Prizren': 4,
      'Ferizaj': 5,
      'Gjilan': 6,
      'Gjakova': 7
    };
    return regionMap[region] || null;
  }

  getStateId(country) {
    const stateMap = {
      'Albania': 1,
      'Kosovo': 2,
      'North Macedonia': 3,
      'Montenegro': 4,
      'Serbia': 5
    };
    return stateMap[country] || null;
  }

  getAuthorityId(authority) {
    const authorityMap = {
      'Ministry of Infrastructure': 1,
      'Ministry of Health': 2,
      'Ministry of Education': 3,
      'Municipality of Tirana': 4
    };
    return authorityMap[authority] || null;
  }
}

export default new TenderService();