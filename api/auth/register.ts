import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT secret for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

interface RegisterRequestBody {
  fullName: string;
  email: string;
  company: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'client';
  company: string;
  created_at: string;
}

/**
 * POST /api/auth/register
 * 
 * Register a new user account
 * 
 * Request Body:
 * {
 *   "fullName": "John Smith",
 *   "email": "john@example.com",
 *   "company": "ABC Roofing",
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
    const { fullName, email, company, password } = req.body as RegisterRequestBody;

    // Validate required fields
    if (!fullName || !email || !company || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields: fullName, email, company, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists'
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine role: First user in the company becomes admin
    const { data: companyUsers } = await supabase
      .from('users')
      .select('id')
      .eq('company', company)
      .limit(1);

    const role = companyUsers && companyUsers.length > 0 ? 'user' : 'admin';

    // Create the user in Supabase
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          name: fullName,
          company: company,
          role: role,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Supabase insert error:', createError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create user account'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      company: newUser.company
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Create a session record
    await supabase
      .from('sessions')
      .insert([
        {
          user_id: newUser.id,
          token: token,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }
      ]);

    // Return user data (without password hash)
    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      company: newUser.company,
      created_at: newUser.created_at
    };

    return res.status(201).json({
      user: userData,
      token: token,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during registration'
    });
  }
}
