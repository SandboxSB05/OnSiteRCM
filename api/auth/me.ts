import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  company: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'client';
  company: string;
}

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "email": "john@example.com",
 *     "name": "John Smith",
 *     "role": "admin",
 *     "company": "ABC Roofing"
 *   }
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Check if session exists in database
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session not found or expired'
      });
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired session
      await supabase
        .from('sessions')
        .delete()
        .eq('token', token);

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired'
      });
    }

    // Get user data from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, company')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Return user data
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company
    };

    return res.status(200).json({
      user: userData
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
