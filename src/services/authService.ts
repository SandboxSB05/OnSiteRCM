/**
 * Authentication Service
 * Handles all authentication-related API calls using Supabase Auth
 */

import { supabase } from '../../lib/supabaseClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'contractor' | 'client';
    company: string;
    phone?: string;
  };
  session: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contractor' | 'client';
  company: string;
  phone?: string;
}

/**
 * Login user with Supabase Auth
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email.toLowerCase(),
      password: credentials.password,
    });

    if (authError) {
      throw new Error(authError.message || 'Invalid email or password');
    }

    if (!authData.user) {
      throw new Error('No user data returned');
    }

    // Fetch user profile from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      throw new Error('Failed to fetch user profile');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company: userData.company || '',
        phone: userData.phone || undefined,
      },
      session: authData.session,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Register new user via serverless API
 * Uses service role to bypass RLS policies
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    // Call the serverless registration endpoint
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        company: userData.company,
        phone: userData.phone,
        password: userData.password,
        role: 'contractor', // Default role
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    // If session was created, set it in Supabase client
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        company: data.user.company,
        phone: data.user.phone,
      },
      session: data.session,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

/**
 * Verify current session and get user data
 */
export const verifySession = async (): Promise<User> => {
  try {
    // Get current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('No active session');
    }

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      throw new Error('Failed to fetch user profile');
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      company: userData.company || '',
      phone: userData.phone || undefined,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Session verification failed');
  }
};

/**
 * Get current user from Supabase session
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!userData) return null;

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      company: userData.company || '',
      phone: userData.phone || undefined,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};
