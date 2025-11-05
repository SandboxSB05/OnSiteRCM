import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;
    if (!authHeader.startsWith('Bearer.')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authorization token' });
    }

    let tokenPayload: any;
    try {
      const base64 = authHeader.split('Bearer.')[1];
      const json = Buffer.from(base64, 'base64').toString('utf8');
      tokenPayload = JSON.parse(json);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token format' });
    }

    if (!tokenPayload?.userId || !tokenPayload?.exp || Date.now() > tokenPayload.exp) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token expired or invalid' });
    }

    if (!supabaseServiceRoleKey) {
      return res.status(500).json({
        error: 'Server misconfiguration',
        message: 'Missing SUPABASE_SERVICE_ROLE_KEY',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
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

    if (tokenPayload.userId) {
      insertData.created_by = tokenPayload.userId;
    }

    // photos - JSONB array
    const photos = Array.isArray(body.progress_photos) 
      ? body.progress_photos 
      : (Array.isArray(body.photos) ? body.photos : null);
    if (photos && photos.length > 0) {
      insertData.photos = photos;
    }

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
  } catch (error) {
    console.error('Create daily update error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the daily update',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
