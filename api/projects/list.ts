import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    // Authorize using our own API token (returned from /api/auth/login)
    // Expect header: Authorization: Bearer.<base64 json payload>
    const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;

    if (!authHeader.startsWith('Bearer.')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authorization token' });
    }

    let tokenPayload: any;
    try {
      const base64 = authHeader.split('Bearer.')[1];
      const json = Buffer.from(base64, 'base64').toString('utf8');
      tokenPayload = JSON.parse(json);
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token format' });
    }

    if (!tokenPayload?.userId || !tokenPayload?.exp || Date.now() > tokenPayload.exp) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token expired or invalid' });
    }

    const userId = String(tokenPayload.userId);
    const role = String(tokenPayload.role || 'contractor');

    const {
      order,
      limit,
      id,
      project_owner_id,
      client_id,
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
      project_owner_id: normalizeParam(project_owner_id),
      client_id: normalizeParam(client_id),
      project_status: normalizeParam(project_status),
      project_type: normalizeParam(project_type),
    };

    // Use service role on the server to bypass RLS safely (NEVER expose this key to clients)
    if (!supabaseServiceRoleKey) {
      return res.status(500).json({ error: 'Server misconfiguration', message: 'Missing SUPABASE_SERVICE_ROLE_KEY' });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Query projects with clients view
    // Filters match MyProjects page semantics
    let query = supabase.from('projects_with_clients').select('*');

    // Apply filters exactly like the website's Project.filter() method
    if (userId && (role === 'contractor' || role === 'admin')) {
      // For contractors/admins, get projects they own (match MyProjects.tsx)
      query = query.eq('project_owner_id', userId);
    } else if (userId && role === 'client') {
      // For clients, get projects where they are the client
      query = query.eq('client_id', userId);
    }

    // Apply additional filters from query string
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

    let { data: projects, error } = await query;
    
    console.log('Supabase query result:', { 
      projectCount: projects?.length, 
      error: error?.message,
      userId, 
      role,
      view: 'projects_with_clients',
      filters
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

      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        if (key === 'id') {
          baseQuery = baseQuery.eq('id', value);
        } else if (typeof value === 'string' && value.includes(',')) {
          const values = value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
          if (values.length > 0) {
            baseQuery = baseQuery.in(key, values);
          }
        } else {
          baseQuery = baseQuery.eq(key, value);
        }
      });

      if (normalizedOrder) {
        const desc = normalizedOrder.startsWith('-');
        const field = desc ? normalizedOrder.substring(1) : normalizedOrder;
        baseQuery = baseQuery.order(field, { ascending: !desc });
      } else {
        baseQuery = baseQuery.order('created_date', { ascending: false });
      }

      if (normalizedLimit) {
        const parsed = parseInt(normalizedLimit, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          baseQuery = baseQuery.limit(parsed);
        }
      }

      const { data: baseProjects, error: baseError } = await baseQuery;
      if (baseError) {
        console.error('Supabase base table error:', baseError);
      } else if (baseProjects && baseProjects.length > 0) {
        projects = baseProjects;
      }
    }

    // Ensure JSON column is consistently present in the response
    const normalizedProjects = (projects || []).map((project: any) => ({
      ...project,
      project_progress:
        project?.project_progress !== undefined ? project.project_progress : null,
    }));

    console.log(
      'Project progress snapshot:',
      normalizedProjects.map((project: any) => ({
        id: project.id,
        project_progress: project.project_progress,
      }))
    );

    // Return real data from Supabase (no mock fallback)
    return res.status(200).json({
      projects: normalizedProjects,
      count: normalizedProjects.length,
      message: normalizedProjects.length ? 'Projects retrieved successfully from database' : 'No projects found',
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
