import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { API_ENDPOINTS } from '../api/endpoints';

// Types
export interface User {
  id: number;
  username: string;
  name: string;
  surname?: string;
  email: string | null;
  role: string;
  status: number;
  full_name?: string;
  is_active?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
}

// Helper function to get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user.id && user.username) {
        return {
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
    }
  } catch (error) {
    // Clear invalid data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

// Initial state
const initialState: AuthState = getInitialState();

// Async thunks
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: credentials.username.trim(),
        password: credentials.password,
      });

      console.log('Login API Response:', response.data);

      // Handle different response formats
      const isSuccess = response.data.success === true || response.status === 200;
      
      if (isSuccess) {
        const userData = response.data.data || response.data.user || response.data;
        const token = response.data.token || response.data.accessToken || response.data.access_token;
        
        console.log('Full API Response:', response.data);
        console.log('User data:', userData);
        console.log('Token:', token);

        if (!userData || !userData.username) {
          return rejectWithValue('No valid user data received from server');
        }

        // If no explicit token, create a session token (fallback)
        const finalToken = token || btoa(JSON.stringify({
          username: userData.username,
          timestamp: Date.now(),
        }));

        // Store the token from backend
        localStorage.setItem('token', finalToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return {
          success: true,
          message: response.data.message || 'Login successful',
          data: userData
        };
      } else {
        return rejectWithValue(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.message || 'Login failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset auth state
    dispatch(clearAuth());
    
    return true;
  }
);

export const loadUserFromStorage = createAsyncThunk<
  { user: User; token: string } | null,
  void,
  { rejectValue: string }
>(
  'auth/loadFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        return null;
      }

      const user = JSON.parse(userStr);
      
      // Validate user data
      if (!user.id || !user.username) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }

      return { user, token };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.token = localStorage.getItem('token');
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      });

    // Load from storage
    builder
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.isLoading = false;
      })
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
      });
  },
});

export const { clearAuth, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;