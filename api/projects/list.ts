import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Query real projects from Supabase using projects_with_clients view
    // This matches exactly how the MyProjects page queries: Project.filter()
    let query = supabase.from('projects_with_clients').select('*');

    // Apply filters exactly like the website's Project.filter() method
    if (userId && (role === 'contractor' || role === 'admin')) {
      // For contractors/admins, get projects they own
      // Support both possible owner column names in the view
      // Uses OR: project_owner_id == userId OR owner_user_id == userId
      query = query.or(`project_owner_id.eq.${userId},owner_user_id.eq.${userId}`);
    } else if (userId && role === 'client') {
      // For clients, get projects where they are the client
      query = query.eq('client_id', userId);
    }

    // Order by created_date descending (newest first)
    const { data: projects, error } = await query.order('created_date', { ascending: false });
    
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

