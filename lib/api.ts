import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Base URL - usar la IP de tu máquina para que funcione en dispositivos móviles
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.98:8008' 
  : 'https://your-production-api.com';

// Storage keys
const TOKEN_KEY = 'auth_token';

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      // Trigger navigation to login (handled by auth context)
    }
    return Promise.reject(error);
  }
);

// ============================================
// API Endpoints
// ============================================

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },
    logout: async () => {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    },
    me: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  },

  // Listings
  listings: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      const response = await apiClient.get('/listings', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/listings/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/listings', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/listings/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/listings/${id}`);
      return response.data;
    },
    uploadImage: async (listingId: string, formData: FormData) => {
      const response = await apiClient.post(`/listings/${listingId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  },

  // Leads
  leads: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      const response = await apiClient.get('/leads', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/leads/${id}`);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/leads/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/leads/${id}`);
      return response.data;
    },
    updateStatus: async (id: string, status: string) => {
      const response = await apiClient.patch(`/leads/${id}/status`, { status });
      return response.data;
    },
  },

  // Partners
  partners: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      const response = await apiClient.get('/partners', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/partners/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/partners', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/partners/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/partners/${id}`);
      return response.data;
    },
  },

  // Tenants
  tenants: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      const response = await apiClient.get('/tenants', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/tenants/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/tenants', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/tenants/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/tenants/${id}`);
      return response.data;
    },
    updateStatus: async (id: string, status: string) => {
      const response = await apiClient.patch(`/tenants/${id}/status`, { status });
      return response.data;
    },
  },

  // Dashboard Stats
  dashboard: {
    getStats: async () => {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    },
  },
};

export default apiClient;
