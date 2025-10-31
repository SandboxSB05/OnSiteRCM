import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;

/**
 * GET /api/projects/list
 * 
 * Get list of projects from Supabase
 * 
 * Query Parameters:
 * - userId: string (optional) - Filter projects by user
 * - role: string (optional) - User role (admin, contractor, client)
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
    const { userId, role } = req.query;
    const supabaseAuthHeader = (req.headers['x-supabase-auth'] || req.headers['x-supabase-token'] || '') as string;

    // Create a Supabase client that forwards the caller's auth (so RLS policies match the web app)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: supabaseAuthHeader
          ? { Authorization: supabaseAuthHeader.startsWith('Bearer') ? supabaseAuthHeader : `Bearer ${supabaseAuthHeader}` }
          : {},
      },
    });

    // Query real projects from Supabase using projects_with_clients view
    // This matches exactly how the MyProjects page queries: Project.filter()
    let query = supabase.from('projects_with_clients').select('*');

    // Apply filters exactly like the website's Project.filter() method
    if (userId && (role === 'contractor' || role === 'admin')) {
      // For contractors/admins, get projects they own (match MyProjects.tsx)
      query = query.eq('project_owner_id', userId);
    } else if (userId && role === 'client') {
      // For clients, get projects where they are the client
      query = query.eq('client_id', userId);
    }

    // Order by created_date descending (newest first)
    let { data: projects, error } = await query.order('created_date', { ascending: false });
    
    console.log('Supabase query result:', { 
      projectCount: projects?.length, 
      error: error?.message,
      userId, 
      role,
      view: 'projects_with_clients'
    });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    // If no results from the view, try querying the base table as a fallback
    if (!projects || projects.length === 0) {
      let baseQuery = supabase.from('projects').select('*');
      if (userId && (role === 'contractor' || role === 'admin')) {
        baseQuery = baseQuery.eq('project_owner_id', userId);
      } else if (userId && role === 'client') {
        baseQuery = baseQuery.eq('client_id', userId);
      }

      const { data: baseProjects, error: baseError } = await baseQuery.order('created_date', { ascending: false });
      if (baseError) {
        console.error('Supabase base table error:', baseError);
      } else if (baseProjects && baseProjects.length > 0) {
        projects = baseProjects;
      }
    }

    // Return real data from Supabase (no mock fallback)
    return res.status(200).json({
      projects: projects || [],
      count: projects?.length || 0,
      message: projects?.length ? 'Projects retrieved successfully from database' : 'No projects found',
      source: 'supabase',
      filters: { userId, role }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

