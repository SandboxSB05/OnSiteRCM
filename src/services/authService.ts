/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  company: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'client';
    company: string;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'client';
  company: string;
}

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('roof_tracker_token');
};

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('roof_tracker_token', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('roof_tracker_token');
  localStorage.removeItem('roof_tracker_user');
  localStorage.removeItem('roof_tracker_remember');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('roof_tracker_user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Store user data in localStorage
 */
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('roof_tracker_user', JSON.stringify(user));
};

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid email or password');
  }

  const data = await response.json();
  
  // Store token and user
  setAuthToken(data.token);
  setCurrentUser(data.user);
  
  return data;
};

/**
 * Register new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Unable to create account');
  }

  const data = await response.json();
  
  // Store token and user
  setAuthToken(data.token);
  setCurrentUser(data.user);
  
  return data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  const token = getAuthToken();
  
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }
  }
  
  // Clear local storage
  removeAuthToken();
};

/**
 * Verify current session and get user data
 */
export const verifySession = async (): Promise<User> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    removeAuthToken();
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();
  
  // Update stored user data
  setCurrentUser(data.user);
  
  return data.user;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser();
};
