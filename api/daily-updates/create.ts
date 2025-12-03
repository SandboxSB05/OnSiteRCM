import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySupabaseJWT } from '../_lib/auth.js';
import { supabaseUserClient } from '../_lib/supabase.js';

const parseRequestBody = (body: any) => {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error('Invalid JSON body');
    }
  }

  return body;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    });
  }

  try {
    // Verify Supabase JWT token
    let token: string;
    let userId: string;
    try {
      const verified = await verifySupabaseJWT(req.headers.authorization as string);
      if (!verified) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing token'
        });
      }
      token = verified.token;
      userId = verified.userId;
    } catch (authError: any) {
      console.error('[JWT Verification Error]', authError?.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: authError?.message || 'Invalid or missing token'
      });
    }
    
    // Create user-scoped Supabase client (RLS will handle authorization)
    const supabase = supabaseUserClient(token);
    const body = parseRequestBody(req.body);

    const projectId = body.project_id;
    // The DB column is `work_description` (per schema). Accept pm_description as an alias.
    const workDescription = body.pm_description || body.work_description || body.work_summary || '';
    if (!projectId || !workDescription) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'project_id and work_description are required',
      });
    }

    const updateDate = body.update_date || new Date().toISOString().split('T')[0];

    // Build insert data with only the columns from your exact DB schema for daily_updates:
    // id, project_id, update_date, work_description, ai_summary, created_by, photos,
    // project_phase_worked_on, project_phase_progress, created_date, updated_date
    const insertData: Record<string, any> = {
      project_id: projectId,
      update_date: updateDate,
      work_description: workDescription,
    };

    // Optional fields - only include if present
    if (body.ai_summary) {
      insertData.ai_summary = body.ai_summary;
    }

    // Set created_by from verified JWT
    insertData.created_by = userId;

    // photos - JSONB array
    // NOTE: Photos should be inserted into the update_photos table, not daily_updates
    // The daily_updates table does not have a photos column in the schema_supabase.sql
    // If you need to store photo metadata alongside the update, use the update_photos table instead
    // For now, we skip photos here to avoid schema mismatch errors

    // project_phase fields
    if (body.project_phase_worked_on || body.project_phase) {
      insertData.project_phase_worked_on = body.project_phase_worked_on || body.project_phase;
    }

    if (body.project_phase_progress !== undefined && body.project_phase_progress !== null) {
      insertData.project_phase_progress = Number(body.project_phase_progress);
    }

    const { data: dailyUpdate, error } = await supabase
      .from('daily_updates')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase daily update insert error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    console.log('Daily update created:', { id: dailyUpdate?.id, project_id: projectId });

    return res.status(201).json({
      message: 'Daily update created successfully',
      dailyUpdate,
    });
  } catch (error: any) {
    console.error('Create daily update error:', error);
    
    // Check if it's an authentication error
    if (error?.message?.includes('JWT') || error?.message?.includes('Authorization')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message || 'Invalid token'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the daily update',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
