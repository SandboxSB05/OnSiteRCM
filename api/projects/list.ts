import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/projects/list
 * 
 * Get list of projects (mock data for testing)
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

    // MOCK DATA - In production, this would query Supabase
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

    // Filter by userId if provided (for demo, all projects belong to any user)
    let filteredProjects = mockProjects;
    
    if (userId && role === 'contractor') {
      // Contractor sees their own projects
      filteredProjects = mockProjects.filter(p => p.project_owner_id === userId);
    } else if (userId && role === 'client') {
      // Client sees projects where they are the client
      filteredProjects = mockProjects.filter(p => p.client_id === userId);
    }
    // Admin or no filter = see all projects

    return res.status(200).json({
      projects: filteredProjects,
      count: filteredProjects.length,
      message: 'Projects retrieved successfully'
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

