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
 * Login user with Supabase Auth
 * Note: Requires RLS policy 'users_view_own' to allow users to read their own record
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

    if (!authData.user || !authData.session) {
      throw new Error('No user data returned');
    }

    // Wait a moment for the session to be fully established
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fetch user profile from public.users table
    // This requires the 'users_view_own' RLS policy to be in place
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      throw new Error(`Failed to fetch user profile: ${userError.message}`);
    }

    if (!userData) {
      throw new Error('No user profile found');
    }

    // Fetch contractor data if user is a contractor
    let companyName = undefined;
    if (userData.role === 'contractor') {
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractors')
        .select('company_name')
        .eq('id', userData.id)
        .single();
      
      if (contractorError) {
        console.error('Error fetching contractor data:', contractorError);
      }
      
      companyName = contractorData?.company_name;
    }

    // Update last login
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error updating last login:', updateError);
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone || undefined,
        companyName: companyName,
      },
      session: authData.session,
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