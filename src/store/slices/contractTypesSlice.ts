import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { API_ENDPOINTS } from '../api/endpoints';

export interface ContractType {
  id: number;
  name: string;
  description?: string;
  code?: string;
  isActive?: boolean;
  created_by?: number;
  updated_by?: number;
  create_date?: number;
  update_date?: number;
  update_no?: number;
}

export interface ContractTypesState {
  contractTypes: ContractType[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const initialState: ContractTypesState = {
  contractTypes: [],
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

export const fetchContractTypes = createAsyncThunk<
  ContractType[],
  void,
  { rejectValue: string }
>(
  'contractTypes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.CONTRACT_TYPES.GET_ALL);
      return response.data.data; // Extract the data array from the API response
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contract types';
      return rejectWithValue(message);
    }
  }
);

export const createContractType = createAsyncThunk<
  ContractType,
  Omit<ContractType, 'id'>,
  { rejectValue: string }
>(
  'contractTypes/create',
  async (contractTypeData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.CONTRACT_TYPES.CREATE, contractTypeData);
      return response.data.data; // Extract the data object from the API response
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create contract type';
      return rejectWithValue(message);
    }
  }
);

export const updateContractType = createAsyncThunk<
  ContractType,
  { id: number; data: Partial<ContractType> },
  { rejectValue: string }
>(
  'contractTypes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.CONTRACT_TYPES.UPDATE(id), data);
      return response.data.data; // Extract the data object from the API response
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update contract type';
      return rejectWithValue(message);
    }
  }
);

export const deleteContractType = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'contractTypes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(API_ENDPOINTS.CONTRACT_TYPES.DELETE(id));
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete contract type';
      return rejectWithValue(message);
    }
  }
);

const contractTypesSlice = createSlice({
  name: 'contractTypes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contract types
    builder
      .addCase(fetchContractTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContractTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contractTypes = action.payload;
        state.error = null;
      })
      .addCase(fetchContractTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch contract types';
      });

    // Create contract type
    builder
      .addCase(createContractType.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createContractType.fulfilled, (state, action) => {
        state.isCreating = false;
        console.log('Created contract type payload:', action.payload);
        state.contractTypes.push(action.payload);
        state.error = null;
      })
      .addCase(createContractType.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create contract type';
      });

    // Update contract type
    builder
      .addCase(updateContractType.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateContractType.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.contractTypes.findIndex(ct => ct.id === action.payload.id);
        if (index !== -1) {
          state.contractTypes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateContractType.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to update contract type';
      });

    // Delete contract type
    builder
      .addCase(deleteContractType.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteContractType.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.contractTypes = state.contractTypes.filter(ct => ct.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteContractType.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || 'Failed to delete contract type';
      });
  },
});

export const { clearError } = contractTypesSlice.actions;
export default contractTypesSlice.reducer;

// Selectors
export const selectContractTypes = (state: { contractTypes: ContractTypesState }) => state.contractTypes.contractTypes;
export const selectContractTypesLoading = (state: { contractTypes: ContractTypesState }) => state.contractTypes.isLoading;
export const selectContractTypesError = (state: { contractTypes: ContractTypesState }) => state.contractTypes.error;
export const selectContractTypesCreating = (state: { contractTypes: ContractTypesState }) => state.contractTypes.isCreating;
export const selectContractTypesUpdating = (state: { contractTypes: ContractTypesState }) => state.contractTypes.isUpdating;
export const selectContractTypesDeleting = (state: { contractTypes: ContractTypesState }) => state.contractTypes.isDeleting;