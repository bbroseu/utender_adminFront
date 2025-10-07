import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { API_ENDPOINTS } from '../api/endpoints';

// Types
export interface ContractingAuthority {
  id: number;
  name: string;
  country: string;
  type: string;
  contact_person: string;
  email: string;
  created_by: string;
  create_date: number;
  create_date_formatted: string;
  updated_by: string;
  update_date: number;
  update_date_formatted: string;
  update_no: number;
  age_seconds: number;
  last_updated_age_seconds: number;
  recently_created: boolean;
  recently_updated: boolean;
}

export interface ContractingAuthorityInput {
  name: string;
  country: string;
  type: string;
  contact_person: string;
  email: string;
  created_by?: string;
  updated_by?: string;
}

export interface ContractingAuthoritiesState {
  authorities: ContractingAuthority[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface SearchParams extends PaginationParams {
  searchTerm: string;
}

// Initial state
const initialState: ContractingAuthoritiesState = {
  authorities: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: '',
};

// Async thunks
export const fetchContractingAuthorities = createAsyncThunk<
  { authorities: ContractingAuthority[]; total: number },
  PaginationParams,
  { rejectValue: string }
>(
  'contractingAuthorities/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { limit = 50, page = 1 } = params;
      
      const response = await api.get(API_ENDPOINTS.CONTRACTING_AUTHORITIES.GET_ALL, {
        params: { limit, page }
      });

      if (response.data.success) {
        return {
          authorities: response.data.data || [],
          total: response.data.pagination?.total || response.data.data?.length || 0,
        };
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch contracting authorities');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contracting authorities');
    }
  }
);

export const searchContractingAuthorities = createAsyncThunk<
  { authorities: ContractingAuthority[]; total: number },
  SearchParams,
  { rejectValue: string }
>(
  'contractingAuthorities/search',
  async (params, { rejectWithValue }) => {
    try {
      const { searchTerm, limit = 20, page = 1 } = params;
      
      const response = await api.get(API_ENDPOINTS.CONTRACTING_AUTHORITIES.SEARCH_BY_NAME, {
        params: { search: searchTerm, limit, page }
      });

      if (response.data.success) {
        return {
          authorities: response.data.data || [],
          total: response.data.pagination?.total || response.data.data?.length || 0,
        };
      } else {
        return rejectWithValue(response.data.message || 'Failed to search contracting authorities');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search contracting authorities');
    }
  }
);

export const createContractingAuthority = createAsyncThunk<
  ContractingAuthority,
  ContractingAuthorityInput,
  { rejectValue: string }
>(
  'contractingAuthorities/create',
  async (authorityData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { username: string } } };
      const username = state.auth.user?.username || 'admin';

      const response = await api.post(API_ENDPOINTS.CONTRACTING_AUTHORITIES.CREATE, {
        ...authorityData,
        created_by: username,
        updated_by: username,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to create contracting authority');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create contracting authority');
    }
  }
);

export const updateContractingAuthority = createAsyncThunk<
  ContractingAuthority,
  { id: number; data: ContractingAuthorityInput },
  { rejectValue: string }
>(
  'contractingAuthorities/update',
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { username: string } } };
      const username = state.auth.user?.username || 'admin';

      const response = await api.put(API_ENDPOINTS.CONTRACTING_AUTHORITIES.UPDATE(id), {
        ...data,
        updated_by: username,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to update contracting authority');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update contracting authority');
    }
  }
);

export const deleteContractingAuthority = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'contractingAuthorities/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_ENDPOINTS.CONTRACTING_AUTHORITIES.DELETE(id));

      if (response.data.success) {
        return id;
      } else {
        return rejectWithValue(response.data.message || 'Failed to delete contracting authority');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete contracting authority');
    }
  }
);

// Slice
const contractingAuthoritiesSlice = createSlice({
  name: 'contractingAuthorities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
    },
    clearAuthorities: (state) => {
      state.authorities = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch all authorities
    builder
      .addCase(fetchContractingAuthorities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractingAuthorities.fulfilled, (state, action) => {
        state.loading = false;
        state.authorities = action.payload.authorities;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchContractingAuthorities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch contracting authorities';
      });

    // Search authorities
    builder
      .addCase(searchContractingAuthorities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchContractingAuthorities.fulfilled, (state, action) => {
        state.loading = false;
        state.authorities = action.payload.authorities;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(searchContractingAuthorities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search contracting authorities';
      });

    // Create authority
    builder
      .addCase(createContractingAuthority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContractingAuthority.fulfilled, (state, action) => {
        state.loading = false;
        state.authorities.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createContractingAuthority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create contracting authority';
      });

    // Update authority
    builder
      .addCase(updateContractingAuthority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContractingAuthority.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.authorities.findIndex(auth => auth.id === action.payload.id);
        if (index !== -1) {
          state.authorities[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateContractingAuthority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update contracting authority';
      });

    // Delete authority
    builder
      .addCase(deleteContractingAuthority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContractingAuthority.fulfilled, (state, action) => {
        state.loading = false;
        state.authorities = state.authorities.filter(auth => auth.id !== action.payload);
        state.total -= 1;
        state.error = null;
      })
      .addCase(deleteContractingAuthority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete contracting authority';
      });
  },
});

export const { 
  clearError, 
  setSearchQuery, 
  setCurrentPage, 
  setItemsPerPage,
  clearAuthorities 
} = contractingAuthoritiesSlice.actions;

export default contractingAuthoritiesSlice.reducer;

// Selectors
export const selectContractingAuthorities = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.authorities;
export const selectContractingAuthoritiesLoading = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.loading;
export const selectContractingAuthoritiesError = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.error;
export const selectContractingAuthoritiesTotal = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.total;
export const selectContractingAuthoritiesCurrentPage = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.currentPage;
export const selectContractingAuthoritiesItemsPerPage = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.itemsPerPage;
export const selectContractingAuthoritiesSearchQuery = (state: { contractingAuthorities: ContractingAuthoritiesState }) => 
  state.contractingAuthorities.searchQuery;