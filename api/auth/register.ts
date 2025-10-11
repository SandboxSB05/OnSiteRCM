import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// JWT secret for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-for-demo';
const JWT_EXPIRES_IN = '24h';

interface RegisterRequestBody {
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  password: string;
  role?: 'admin' | 'contractor' | 'client';
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contractor' | 'client';
  company: string;
  phone?: string;
}

/**
 * POST /api/auth/register
 * 
 * Register a new user with Supabase Auth and create user profile
 * This function uses service role key to bypass RLS policies
 * 
 * Request Body:
 * {
 *   "fullName": "John Smith",
 *   "email": "john@example.com",
 *   "company": "ABC Roofing",
 *   "phone": "555-1234",
 *   "password": "securepassword123",
 *   "role": "contractor" // optional, defaults to contractor
 * }
 * 
 * Response:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "email": "john@example.com",
 *     "name": "John Smith",
 *     "role": "contractor",
 *     "company": "ABC Roofing",
 *     "phone": "555-1234"
 *   },
 *   "session": { ... },
 *   "message": "Registration successful"
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { fullName, email, company, phone, password, role = 'contractor' } = req.body as RegisterRequestBody;

    // Validate required fields
    if (!fullName || !email || !company || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, company, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Validate role
    if (!['admin', 'contractor', 'client'].includes(role)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Role must be admin, contractor, or client'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists'
      });
    }

    // Create auth user with Supabase Auth (admin API)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true, // Auto-confirm email in production, you may want to send confirmation emails
      user_metadata: {
        full_name: fullName,
        company: company,
        phone: phone
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(500).json({
        error: 'Registration failed',
        message: authError.message || 'Failed to create authentication account'
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        error: 'Registration failed',
        message: 'No user data returned from authentication service'
      });
    }

    // Create user profile in users table (bypassing RLS with service role)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: normalizedEmail,
        name: fullName,
        company: company,
        phone: phone || null,
        role: role,
        password_hash: '', // Empty string since Supabase Auth handles passwords
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Cleanup: Delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({
        error: 'Registration failed',
        message: profileError.message || 'Failed to create user profile'
      });
    }

    if (!userProfile) {
      // Cleanup: Delete the auth user if no profile was returned
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({
        error: 'Registration failed',
        message: 'Failed to create user profile'
      });
    }

    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });

    if (sessionError || !sessionData.session) {
      console.error('Session creation error:', sessionError);
      // User is created but auto-login failed - they can login manually
      return res.status(201).json({
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          company: userProfile.company,
          phone: userProfile.phone || undefined,
        },
        session: null,
        message: 'Registration successful. Please log in.'
      });
    }

    // Generate JWT token for backwards compatibility
    const tokenPayload = {
      userId: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      company: userProfile.company
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Return success response
    return res.status(201).json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        company: userProfile.company,
        phone: userProfile.phone || undefined,
      },
      session: sessionData.session,
      token: token,
      message: 'Registration successful'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred during registration'
    });
  }
}
