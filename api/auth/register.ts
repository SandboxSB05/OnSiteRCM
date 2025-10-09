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

    // MOCK DATA - In production, this would check the database
    // For demo purposes, we accept all registrations
    const userId = 'user-' + Date.now();
    const role = 'user'; // Default role for new users

    // Generate JWT token
    const tokenPayload = {
      userId: userId,
      email: email.toLowerCase(),
      role: role,
      company: company
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Return user data
    const userData: User = {
      id: userId,
      email: email.toLowerCase(),
      name: fullName,
      role: role,
      company: company,
      created_at: new Date().toISOString()
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
