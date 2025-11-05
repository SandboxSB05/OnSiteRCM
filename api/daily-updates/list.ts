import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSingleQueryParam = (value: string | string[] | undefined) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests',
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

    const projectIdParam =
      (req.query['project_id'] as string | string[] | undefined) ??
      (req.query['projectId'] as string | string[] | undefined);
    const projectId = getSingleQueryParam(projectIdParam);
    if (!projectId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'project_id query parameter is required',
      });
    }

    const normalizedLimit = getSingleQueryParam(req.query['limit'] as string | string[] | undefined);
    const normalizedOrder = getSingleQueryParam(req.query['order'] as string | string[] | undefined);
    const fromDate = getSingleQueryParam(req.query['from_date'] as string | string[] | undefined);
    const toDate = getSingleQueryParam(req.query['to_date'] as string | string[] | undefined);

    let query = supabase
      .from('daily_updates')
      .select('*')
      .eq('project_id', projectId);

    if (fromDate) {
      query = query.gte('update_date', fromDate);
    }

    if (toDate) {
      query = query.lte('update_date', toDate);
    }

    if (normalizedOrder) {
      const desc = normalizedOrder.startsWith('-');
      const field = desc ? normalizedOrder.substring(1) : normalizedOrder;
      query = query.order(field, { ascending: !desc });
    } else {
      query = query
        .order('update_date', { ascending: false })
        .order('created_date', { ascending: false });
    }

    if (normalizedLimit) {
      const parsed = parseInt(normalizedLimit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        query = query.limit(parsed);
      }
    }

    const { data: dailyUpdates, error } = await query;

    if (error) {
      console.error('Supabase daily updates list error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    const normalizedUpdates = (dailyUpdates || []).map((update: any) => ({
      ...update,
      photos: Array.isArray(update?.photos)
        ? update.photos
        : update?.photos
          ? update.photos
          : [],
    }));

    console.log('Daily updates retrieved:', {
      project_id: projectId,
      count: normalizedUpdates.length,
      limit: normalizedLimit,
      order: normalizedOrder,
    });

    return res.status(200).json({
      message: normalizedUpdates.length ? 'Daily updates retrieved successfully' : 'No daily updates found',
      project_id: projectId,
      dailyUpdates: normalizedUpdates,
      count: normalizedUpdates.length,
    });
  } catch (error) {
    console.error('List daily updates error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while listing daily updates',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
