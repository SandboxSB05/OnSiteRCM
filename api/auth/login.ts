import { VercelRequest, VercelResponse } from '@vercel/node';
// import { createClient } from '@supabase/supabase-js';
// import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Mock mode - no external dependencies required
// const supabaseUrl = process.env.SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT secret for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-for-demo';
const JWT_EXPIRES_IN = '24h';

interface LoginRequestBody {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contractor' | 'client';
  company: string;
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

    // MOCK DATA - Accept any email/password combination
    // In production, this would query a real database
    const mockUsers: Record<string, User> = {
      'admin@onsite.com': {
        id: 'user-1',
        email: 'admin@onsite.com',
        name: 'Admin User',
        role: 'admin',
        company: 'OnSite Roofing'
      },
      'user@onsite.com': {
        id: 'user-2',
        email: 'user@onsite.com',
        name: 'Regular User',
        role: 'contractor',
        company: 'OnSite Roofing'
      },
      'client@example.com': {
        id: 'user-3',
        email: 'client@example.com',
        name: 'Client User',
        role: 'client',
        company: 'Example Corp'
      }
    };

    // Find user or create a default one
    const user = mockUsers[email.toLowerCase()] || {
      id: 'user-default',
      email: email.toLowerCase(),
      name: 'Demo User',
      role: 'contractor' as const,
      company: 'Demo Company'
    };

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      company: user.company
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Return user data
    return res.status(200).json({
      user: user,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login'
    });
  }
}
