import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.10.209:3000/api',
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't add Authorization header for login/auth requests
    const isAuthRequest = config.url?.includes('/login') || 
                         config.url?.includes('/auth') ||
                         config.url?.includes('/bootstrap');
    
    if (!isAuthRequest) {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication and format errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Check if it's a 401 error and not a login request
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/login') || 
                            error.config?.url?.includes('/auth');
      
      if (!isLoginRequest) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }

    // Format error response
    const formattedError = {
      message: error.response?.data?.message || 
               error.message || 
               'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    return Promise.reject(formattedError);
  }
);

export default api;