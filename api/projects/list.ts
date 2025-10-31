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

    // Query real projects from Supabase using the projects_with_clients view
    let query = supabase.from('projects_with_clients').select('*');

    // Filter by user if provided
    if (userId && role === 'contractor') {
      query = query.eq('project_owner_id', userId);
    } else if (userId && role === 'client') {
      query = query.eq('client_id', userId);
    }

    const { data: projects, error } = await query.order('created_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details
      });
    }

    // If no real projects, return mock data as fallback
    if (!projects || projects.length === 0) {
      const mockProjects = [
      {
        id: 'proj-1',
        project_name: 'Wilson Residence Roof Replacement',
        client_name: 'Sarah Wilson',
        client_id: 'user-default',
        project_owner_id: 'user-default',
        address_line1: '123 Oak Street',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94102',
        project_type: 'Roof Replacement',
        status: 'in_progress',
        completion_percentage: 75,
        created_date: '2024-01-15',
        start_date: '2024-02-01',
        estimated_completion_date: '2024-03-15',
        budget: 25000,
        actual_cost: 18000
      },
      {
        id: 'proj-2',
        project_name: 'Johnson Commercial Building',
        client_name: 'Mike Johnson',
        client_id: 'user-default',
        project_owner_id: 'user-default',
        address_line1: '456 Pine Avenue',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94103',
        project_type: 'Roof Repair',
        status: 'in_progress',
        completion_percentage: 50,
        created_date: '2024-02-01',
        start_date: '2024-02-15',
        estimated_completion_date: '2024-04-01',
        budget: 45000,
        actual_cost: 22500
      },
      {
        id: 'proj-3',
        project_name: 'Davis Kitchen Remodel',
        client_name: 'Jennifer Davis',
        client_id: 'user-default',
        project_owner_id: 'user-default',
        address_line1: '789 Maple Drive',
        city: 'Oakland',
        state: 'CA',
        zip_code: '94601',
        project_type: 'Roof Inspection',
        status: 'planning',
        completion_percentage: 25,
        created_date: '2024-03-01',
        start_date: null,
        estimated_completion_date: '2024-05-01',
        budget: 15000,
        actual_cost: 3750
      }
      ];

      return res.status(200).json({
        projects: mockProjects,
        count: mockProjects.length,
        message: 'Projects retrieved successfully (fallback mock data)',
        source: 'mock'
      });
    }

    return res.status(200).json({
      projects: projects,
      count: projects.length,
      message: 'Projects retrieved successfully from database',
      source: 'supabase'
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

