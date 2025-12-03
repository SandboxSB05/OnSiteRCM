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
  companyName?: string; // Only for contractors
  phone?: string;
  password: string;
  role?: 'admin' | 'contractor' | 'crew_lead';
  contractorId?: string; // Only for crew_leads
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'contractor' | 'crew_lead';
    phone?: string;
    companyName?: string; // Only for contractors
  };
  session: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contractor' | 'crew_lead';
  phone?: string;
  companyName?: string; // Only for contractors
}

/**
 * Login user via backend API endpoint
 * This returns a proper Supabase session with access_token and refresh_token
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Call the backend login endpoint (which uses the anon key)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.toLowerCase(),
        password: credentials.password,
      }),
    });

    // Try to parse response as JSON
    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Server returned invalid response. Please check API configuration.');
    }

    if (!response.ok) {
      const errorMsg = data.details || data.message || 'Login failed';
      console.error('Login failed:', errorMsg);
      throw new Error(errorMsg);
    }

    // Set the session in the Supabase client so it's available for future calls
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    console.log('🔐 LOGIN SUCCESSFUL - Session received with access_token');
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        phone: data.user.phone,
        companyName: data.user.companyName,
      },
      session: data.session,
    };
  } catch (error: any) {
    console.error('Login error details:', error);
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
        companyName: userData.companyName,
        phone: userData.phone,
        password: userData.password,
        role: userData.role || 'contractor', // Default role
        contractorId: userData.contractorId,
      }),
    });

    // Try to parse response as JSON
    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Server returned invalid response. Please check API configuration.');
    }

    if (!response.ok) {
      const errorMsg = data.details || data.message || 'Registration failed';
      console.error('Registration failed:', errorMsg);
      throw new Error(errorMsg);
    }

    // If session was created, set it in Supabase client
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    console.log('🔐 REGISTRATION SUCCESSFUL - Session received with access_token');
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        phone: data.user.phone,
        companyName: data.user.companyName,
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

    // Fetch contractor data if user is a contractor
    let companyName = undefined;
    if (userData.role === 'contractor') {
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('company_name')
        .eq('id', userData.id)
        .single();
      
      companyName = contractorData?.company_name;
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || undefined,
      companyName: companyName,
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

    // Fetch contractor data if user is a contractor
    let companyName = undefined;
    if (userData.role === 'contractor') {
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('company_name')
        .eq('id', userData.id)
        .single();
      
      companyName = contractorData?.company_name;
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || undefined,
      companyName: companyName,
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