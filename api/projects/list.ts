import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySupabaseJWT } from '../_lib/auth';
import { supabaseUserClient } from '../_lib/supabase';

/**
 * GET /api/projects/list
 * 
 * Get list of projects from Supabase with RLS-based filtering
 * 
 * Query Parameters:
 * - id: string (optional) - Filter by specific project ID
 * - project_status: string (optional) - Comma-separated list of statuses
 * - project_type: string (optional) - Comma-separated list of types
 * - order: string (optional) - Sort field (prefix with - for descending)
 * - limit: number (optional) - Limit number of results
 * 
 * Response:
 * {
 *   "projects": [...],
 *   "count": number
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
    // Verify Supabase JWT token
    let token: string;
    try {
      const verified = await verifySupabaseJWT(req.headers.authorization as string);
      token = verified.token;
    } catch (authError: any) {
      console.error('[JWT Verification Error]', authError?.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: authError?.message || 'Invalid or missing token'
      });
    }
    
    // Create user-scoped Supabase client (RLS will handle filtering)
    const supabase = supabaseUserClient(token);

    const {
      order,
      limit,
      id,
      project_status,
      project_type,
    } = req.query;

    const normalizeParam = (value: string | string[] | undefined) => {
      if (!value) return undefined;
      return Array.isArray(value) ? value[0] : value;
    };

    const normalizedOrder = normalizeParam(order);
    const normalizedLimit = normalizeParam(limit);
    const filters = {
      id: normalizeParam(id),
      project_status: normalizeParam(project_status),
      project_type: normalizeParam(project_type),
    };

    // Query projects with clients view
    // RLS policies will automatically filter based on the authenticated user
    let query = supabase.from('projects_with_clients').select('*');

    // Apply filters from query string (NOT from client-provided userId/role!)
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'id') {
        query = query.eq('id', value);
      } else if (typeof value === 'string' && value.includes(',')) {
        const values = value
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        if (values.length > 0) {
          query = query.in(key, values);
        }
      } else {
        query = query.eq(key, value);
      }
    });

    // Handle ordering
    if (normalizedOrder) {
      const desc = normalizedOrder.startsWith('-');
      const field = desc ? normalizedOrder.substring(1) : normalizedOrder;
      query = query.order(field, { ascending: !desc });
    } else {
      query = query.order('created_date', { ascending: false });
    }

    // Handle limit
    if (normalizedLimit) {
      const parsed = parseInt(normalizedLimit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        query = query.limit(parsed);
      }
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    // Ensure JSON column is consistently present in the response
    const normalizedProjects = (projects || []).map((project: any) => ({
      ...project,
      project_progress:
        project?.project_progress !== undefined ? project.project_progress : null,
    }));

    // Return real data from Supabase
    return res.status(200).json({
      projects: normalizedProjects,
      count: normalizedProjects.length,
    });

  } catch (error: any) {
    console.error('Get projects error:', error);
    
    // Check if it's an authentication error
    if (error?.message?.includes('JWT') || error?.message?.includes('Authorization')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message || 'Invalid token'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
