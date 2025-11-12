import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface RegisterRequestBody {
  fullName: string;
  email: string;
  companyName?: string; // Only for contractors
  phone?: string;
  password: string;
  role?: 'admin' | 'contractor' | 'crew_lead';
  contractorId?: string; // Only for crew_leads - contractor they belong to
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contractor' | 'crew_lead';
  phone?: string;
  companyName?: string; // Only for contractors
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
 *   "companyName": "ABC Roofing", // Required for contractors
 *   "phone": "555-1234",
 *   "password": "securepassword123",
 *   "role": "contractor", // 'admin', 'contractor', or 'crew_lead'
 *   "contractorId": "uuid" // Required for crew_leads
 * }
 * 
 * Response:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "email": "john@example.com",
 *     "name": "John Smith",
 *     "role": "contractor",
 *     "phone": "555-1234",
 *     "companyName": "ABC Roofing"
 *   },
 *   "session": { ... },
 *   "message": "Registration successful"
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Initialize Supabase client with service role key to bypass RLS
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      env: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Supabase environment variables are not configured'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { fullName, email, companyName, phone, password, role = 'contractor', contractorId } = req.body as RegisterRequestBody;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, and password are required'
      });
    }

    // Validate role-specific requirements
    if (role === 'contractor' && !companyName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Company name is required for contractors'
      });
    }

    if (role === 'crew_lead' && !contractorId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Contractor ID is required for crew leads'
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
    if (!['admin', 'contractor', 'crew_lead'].includes(role)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Role must be admin, contractor, or crew_lead'
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
      email_confirm: true, // Auto-confirm email in production
      user_metadata: {
        full_name: fullName,
        phone: phone,
        role: role
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
        phone: phone || null,
        role: role,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
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

    // Create role-specific records
    if (role === 'contractor') {
      const { error: contractorError } = await supabase
        .from('contractors')
        .insert({
          id: authData.user.id,
          company_name: companyName,
          verified: false,
          subscription_tier: 'basic',
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        });

      if (contractorError) {
        console.error('Contractor record creation error:', contractorError);
        // Cleanup
        await supabase.from('users').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return res.status(500).json({
          error: 'Registration failed',
          message: 'Failed to create contractor record'
        });
      }
    } else if (role === 'crew_lead') {
      const { error: crewLeadError } = await supabase
        .from('crew_leads')
        .insert({
          id: authData.user.id,
          contractor_id: contractorId,
          status: 'pending',
          phone: phone || null,
          invited_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (crewLeadError) {
        console.error('Crew lead record creation error:', crewLeadError);
        // Cleanup
        await supabase.from('users').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return res.status(500).json({
          error: 'Registration failed',
          message: 'Failed to create crew lead record'
        });
      }
    }

    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });

    // Prepare user response
    const userResponse: any = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      phone: userProfile.phone || undefined,
    };

    // Add company name for contractors
    if (role === 'contractor') {
      userResponse.companyName = companyName;
    }

    if (sessionError || !sessionData.session) {
      console.error('Session creation error:', sessionError);
      // User is created but auto-login failed - they can login manually
      return res.status(201).json({
        user: userResponse,
        session: null,
        message: 'Registration successful. Please log in.'
      });
    }

    // Return success response
    return res.status(201).json({
      user: userResponse,
      session: sessionData.session,
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
