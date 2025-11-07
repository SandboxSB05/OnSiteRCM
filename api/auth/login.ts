import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

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

    // Generate token with real user data
    const tokenPayload = {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    // Create a simple base64 token
    const token = `Bearer.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}`;

    // Prepare user response
    const userResponse: any = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || undefined
    };

    // Add company name for contractors
    if (companyName) {
      userResponse.companyName = companyName;
    }

    // Return real user data
    return res.status(200).json({
      user: userResponse,
      token: token,
      supabaseAccessToken: authData.session?.access_token || null,
      supabaseRefreshToken: authData.session?.refresh_token || null,
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
