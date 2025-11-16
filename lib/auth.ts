import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import { User, UserRole } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await api.auth.login(credentials.email, credentials.password);
    
    // API returns { success: true, data: { user, token } }
    const { data } = response;
    
    // Save token
    if (data.token) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    }
    
    // Save user data
    if (data.user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
    }
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout and clear stored data
 */
export const logout = async (): Promise<void> => {
  try {
    await api.auth.logout();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get stored authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Get stored user data
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};

/**
 * Validate current session
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    if (!token) return false;
    
    // Try to get current user from API
    await api.auth.me();
    return true;
  } catch (error) {
    // Session invalid - clear data
    await logout();
    return false;
  }
};

/**
 * Get user role
 */
export const getUserRole = async (): Promise<UserRole | null> => {
  const user = await getUser();
  return user?.role || null;
};

/**
 * Check if user is manager
 */
export const isManager = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'manager';
};

/**
 * Check if user is owner
 */
export const isOwner = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'owner';
};

/**
 * Check if user is tenant
 */
export const isTenant = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'tenant';
};
