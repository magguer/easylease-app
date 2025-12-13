import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// API Base URL - usar la IP de tu máquina para que funcione en dispositivos móviles
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.26:8008'
  : Constants.expoConfig?.extra?.apiUrl || 'https://easylease-api.vercel.app/api';

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
    uploadImages: async (formData: FormData) => {
      const response = await apiClient.post('/listings/upload-images', formData, {
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

  // Owners
  owners: {
    getAll: async () => {
      const response = await apiClient.get('/owners');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/owners/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/owners', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/owners/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/owners/${id}`);
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
    unlink: async (id: string) => {
      const response = await apiClient.post(`/tenants/${id}/unlink`);
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

  // Contracts
  contracts: {
    getAll: async (params?: { status?: string; tenant_id?: string; listing_id?: string; owner_id?: string }) => {
      const response = await apiClient.get('/contracts', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/contracts/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/contracts', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/contracts/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/contracts/${id}`);
      return response.data;
    },
    terminate: async (id: string, termination_reason?: string) => {
      const response = await apiClient.post(`/contracts/${id}/terminate`, { termination_reason });
      return response.data;
    },
    restart: async (id: string) => {
      const response = await apiClient.post(`/contracts/${id}/restart`);
      return response.data;
    },
    duplicate: async (id: string, data?: { start_date?: string; end_date?: string }) => {
      const response = await apiClient.post(`/contracts/${id}/duplicate`, data);
      return response.data;
    },
    assignTenant: async (id: string, tenant_id: string) => {
      const response = await apiClient.post(`/contracts/${id}/assign-tenant`, { tenant_id });
      return response.data;
    },
    addDocument: async (id: string, document: { type: string; name: string; url: string }) => {
      const response = await apiClient.post(`/contracts/${id}/documents`, document);
      return response.data;
    },
    removeDocument: async (id: string, documentId: string) => {
      const response = await apiClient.delete(`/contracts/${id}/documents/${documentId}`);
      return response.data;
    },
  },

  // Payments
  payments: {
    getAll: async (params?: { contract_id?: string; tenant_id?: string; startDate?: string; endDate?: string }) => {
      const response = await apiClient.get('/payments', { params });
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/payments', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/payments/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/payments/${id}`);
      return response.data;
    },
    getStats: async (owner_id?: string) => {
      const params = owner_id ? { owner_id } : {};
      const response = await apiClient.get('/payments/stats', { params });
      return response.data;
    }
  },

  // Documents
  documents: {
    getAll: async (entity_type: string, entity_id: string) => {
      const response = await apiClient.get('/documents', {
        params: { entity_type, entity_id }
      });
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/documents', data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    },
  },
};

export default apiClient;
