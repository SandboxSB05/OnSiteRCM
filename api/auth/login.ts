import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface LoginRequestBody {
  email: string;
  password: string;
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
 * POST /api/auth/login
 * 
 * Authenticate user and return JWT token
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "email": "john@example.com",
 *     "name": "John Smith",
 *     "role": "admin",
 *     "company": "ABC Roofing"
 *   },
 *   "token": "jwt-token"
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Initialize Supabase client with current environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  console.log('🔐 [Login Handler] Starting login request');
  console.log('🔐 [Login Handler] VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓' : '✗');
  console.log('🔐 [Login Handler] SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗');
  console.log('🔐 [Login Handler] VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? `✓ (${process.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...)` : '✗');
  console.log('🔐 [Login Handler] SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? `✓ (${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...)` : '✗');
  console.log('🔐 [Login Handler] All env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [Login Handler] Missing Supabase environment variables', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl,
      keyStart: supabaseAnonKey?.substring(0, 20)
    });
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Supabase environment variables are not configured',
      details: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }
    });
  }

  console.log('✅ [Login Handler] Creating Supabase client with URL:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { email, password } = req.body as LoginRequestBody;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    console.log('🔐 [Login Handler] Attempting to authenticate email:', email.toLowerCase());

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (authError) {
      console.error('❌ [Login Handler] Authentication error:', authError);
      return res.status(401).json({
        error: 'Authentication failed',
        message: authError.message || 'Invalid email or password',
        details: authError.message
      });
    }

    if (!authData.user) {
      console.error('❌ [Login Handler] No user returned from Supabase');
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    console.log('✅ [Login Handler] User authenticated:', authData.user.id);

    // Fetch user profile from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return res.status(500).json({
        error: 'Profile error',
        message: 'Failed to fetch user profile'
      });
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

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    // Prepare user response
    const userResponse: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || undefined,
      companyName: companyName,
    };

    // Return Supabase session tokens (no more custom Bearer. tokens!)
    return res.status(200).json({
      user: userResponse,
      session: authData.session, // Contains access_token and refresh_token
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
