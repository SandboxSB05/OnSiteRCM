import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_BUCKET = 'onsite-photos';
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const getSingleQueryParam = (value: string | string[] | undefined) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const parseAuthToken = (headerValue: string | string[] | undefined) => {
  const rawHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue || '';
  if (!rawHeader.startsWith('Bearer ') && !rawHeader.startsWith('Bearer.')) {
    return { error: 'Missing or invalid authorization token' };
  }

  try {
    const base64 = rawHeader.replace(/^Bearer[\s.]+/, '');
    if (!base64) {
      return { error: 'Missing or invalid authorization token' };
    }

    const json = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(json);

    if (!payload?.userId || !payload?.exp || Date.now() > payload.exp) {
      return { error: 'Token expired or invalid' };
    }

    return { payload };
  } catch (error) {
    console.error('[Daily Update Photos] Token parse error:', error);
    return { error: 'Invalid token format' };
  }
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests',
    });
  }

  try {
    const { error: authError } = parseAuthToken(req.headers['authorization'] || req.headers['Authorization']);
    if (authError) {
      return res.status(401).json({ error: 'Unauthorized', message: authError });
    }

    if (!supabaseServiceRoleKey) {
      return res.status(500).json({
        error: 'Server misconfiguration',
        message: 'Missing SUPABASE_SERVICE_ROLE_KEY',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const idParam =
      (req.query['daily_update_id'] as string | string[] | undefined) ??
      (req.query['dailyUpdateId'] as string | string[] | undefined);
    const dailyUpdateId = getSingleQueryParam(idParam);

    if (!dailyUpdateId || !isUuid(dailyUpdateId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'daily_update_id query parameter is required and must be a valid UUID',
      });
    }

    const { data: photoRows, error } = await supabase
      .from('update_photos')
      .select('*')
      .eq('daily_update_id', dailyUpdateId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Daily Update Photos] Supabase query error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    const photos = await Promise.all(
      (photoRows || []).map(async (row) => {
        const bucket = row.storage_bucket || DEFAULT_BUCKET;
        const path = row.storage_path || '';
        const storageRef = supabase.storage.from(bucket);
        const publicUrlData = path ? storageRef.getPublicUrl(path).data : undefined;
        let signedUrl: string | null = null;
        if (path) {
          try {
            const { data: signedData, error: signedError } = await storageRef.createSignedUrl(
              path,
              SIGNED_URL_TTL_SECONDS
            );
            if (!signedError) {
              signedUrl = signedData?.signedUrl || null;
            } else {
              console.warn('[Daily Update Photos] Signed URL error:', signedError);
            }
          } catch (signedError) {
            console.warn('[Daily Update Photos] Failed to create signed URL:', signedError);
          }
        }

        const platformReadyUrl = signedUrl || publicUrlData?.publicUrl || null;

        return {
          id: row.id,
          daily_update_id: row.daily_update_id,
          storage_bucket: bucket,
          storage_path: path,
          uploaded_by: row.uploaded_by,
          created_at: row.created_at,
          public_url: publicUrlData?.publicUrl || null,
          signed_url: signedUrl,
          url: platformReadyUrl,
          download_url: platformReadyUrl,
        };
      })
    );

    console.log('[Daily Update Photos] Photos retrieved:', {
      daily_update_id: dailyUpdateId,
      count: photos.length,
    });

    return res.status(200).json({
      message: photos.length ? 'Daily update photos retrieved successfully' : 'No photos found for this daily update',
      daily_update_id: dailyUpdateId,
      count: photos.length,
      photos,
    });
  } catch (error) {
    console.error('[Daily Update Photos] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving daily update photos',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
