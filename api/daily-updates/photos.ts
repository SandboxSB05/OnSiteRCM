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

const sanitizePathSegment = (value?: string | null) => {
  if (!value) {
    return '';
  }
  return value
    .split(/[/\\]/)
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter(Boolean)
    .join('/');
};

const listFilesRecursively = async (
  supabase: any,
  bucket: string,
  folderPath: string,
  allFiles: any[] = []
) => {
  const { data: items, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (error) {
    console.warn(`[Daily Update Photos] Warning listing ${folderPath}: ${error.message}`);
    return allFiles;
  }

  for (const item of items || []) {
    if (item.name.startsWith('.')) continue;

    const itemPath = `${folderPath}/${item.name}`;
    
    if (!item.metadata) {
      // It's a directory (folders don't have metadata in Supabase)
      console.log(`[Daily Update Photos] Recursing into folder: ${itemPath}`);
      await listFilesRecursively(supabase, bucket, itemPath, allFiles);
    } else {
      // It's a file (files have metadata like size, mimetype)
      console.log(`[Daily Update Photos] Found file: ${itemPath}`);
      allFiles.push({
        ...item,
        fullPath: itemPath,
      });
    }
  }

  return allFiles;
};

const buildPhotoFromFile = async (
  supabase: any,
  bucket: string,
  file: any
) => {
  const filePath = file.fullPath;
  const storageRef = supabase.storage.from(bucket);
  const publicUrlData = storageRef.getPublicUrl(filePath).data;
  let signedUrl: string | null = null;

  try {
    const { data: signedData, error: signedError } = await storageRef.createSignedUrl(
      filePath,
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

  const platformReadyUrl = signedUrl || publicUrlData?.publicUrl || null;

  return {
    id: `${file.name}-${file.created_at}`,
    file_name: file.name,
    storage_bucket: bucket,
    storage_path: filePath,
    created_at: file.created_at,
    public_url: publicUrlData?.publicUrl || null,
    signed_url: signedUrl,
    url: platformReadyUrl,
    download_url: platformReadyUrl,
  };
};

const getPhotosFromPhaseFolder = async (
  supabase: any,
  projectId: string,
  phaseName: string,
  bucket: string
) => {
  const sanitizedProjectId = sanitizePathSegment(projectId);
  const sanitizedPhaseName = sanitizePathSegment(phaseName);
  const folderPath = `${sanitizedProjectId}/${sanitizedPhaseName}`;

  console.log('[Daily Update Photos] Listing files recursively from phase folder:', folderPath);

  const files = await listFilesRecursively(supabase, bucket, folderPath);

  console.log('[Daily Update Photos] Found files:', files.length);

  const photos = await Promise.all(
    files.map((file: any) => buildPhotoFromFile(supabase, bucket, file))
  );

  return photos;
};

const getPhotosFromDailyUpdateFolder = async (
  supabase: any,
  projectId: string,
  phaseName: string,
  dailyUpdateId: string,
  bucket: string
) => {
  const sanitizedProjectId = sanitizePathSegment(projectId);
  const sanitizedPhaseName = sanitizePathSegment(phaseName);
  const sanitizedDailyUpdateId = sanitizePathSegment(dailyUpdateId);
  const folderPath = `${sanitizedProjectId}/${sanitizedPhaseName}/${sanitizedDailyUpdateId}`;

  console.log('[Daily Update Photos] Listing files from daily update folder:', folderPath);
  console.log('[Daily Update Photos] Debug - Original values:', {
    projectId,
    phaseName,
    dailyUpdateId,
  });
  console.log('[Daily Update Photos] Debug - Sanitized values:', {
    sanitizedProjectId,
    sanitizedPhaseName,
    sanitizedDailyUpdateId,
  });

  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (error) {
    console.error('[Daily Update Photos] Error listing files:', error);
    console.error('[Daily Update Photos] Tried to list path:', folderPath);
    return [];
  }

  console.log('[Daily Update Photos] Files in folder:', files);

  const photos = await Promise.all(
    (files || [])
      .filter((file: any) => !file.name.startsWith('.'))
      .map((file: any) => buildPhotoFromFile(supabase, bucket, { ...file, fullPath: `${folderPath}/${file.name}` }))
  );

  return photos;
};

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
    const bucket = DEFAULT_BUCKET;

    // Extract query parameters
    const projectIdParam = getSingleQueryParam(
      (req.query['project_id'] as string | string[] | undefined) ??
        (req.query['projectId'] as string | string[] | undefined)
    );
    const phaseNameParam = getSingleQueryParam(
      (req.query['phase_name'] as string | string[] | undefined) ??
        (req.query['phaseName'] as string | string[] | undefined)
    );
    const dailyUpdateIdParam = getSingleQueryParam(
      (req.query['daily_update_id'] as string | string[] | undefined) ??
        (req.query['dailyUpdateId'] as string | string[] | undefined)
    );

    // Query 1: Get photos from a specific daily update (projectId + phaseName + dailyUpdateId)
    if (projectIdParam && phaseNameParam && dailyUpdateIdParam) {
      console.log('[Daily Update Photos] Query by project, phase, and daily update:', {
        project_id: projectIdParam,
        phase_name: phaseNameParam,
        daily_update_id: dailyUpdateIdParam,
      });

      const photos = await getPhotosFromDailyUpdateFolder(
        supabase,
        projectIdParam,
        phaseNameParam,
        dailyUpdateIdParam,
        bucket
      );

      console.log('[Daily Update Photos] Daily update photos retrieved:', {
        project_id: projectIdParam,
        phase_name: phaseNameParam,
        daily_update_id: dailyUpdateIdParam,
        count: photos.length,
      });

      return res.status(200).json({
        message: photos.length
          ? 'Photos retrieved successfully from daily update folder'
          : 'No photos found for this daily update',
        project_id: projectIdParam,
        phase_name: phaseNameParam,
        daily_update_id: dailyUpdateIdParam,
        count: photos.length,
        photos,
      });
    }

    // Query 2: Get all photos from a phase (projectId + phaseName)
    if (projectIdParam && phaseNameParam) {
      console.log('[Daily Update Photos] Query by project and phase:', {
        project_id: projectIdParam,
        phase_name: phaseNameParam,
      });

      const photos = await getPhotosFromPhaseFolder(supabase, projectIdParam, phaseNameParam, bucket);

      console.log('[Daily Update Photos] Phase photos retrieved:', {
        project_id: projectIdParam,
        phase_name: phaseNameParam,
        count: photos.length,
      });

      return res.status(200).json({
        message: photos.length
          ? 'Photos retrieved successfully from phase folder'
          : 'No photos found in this phase',
        project_id: projectIdParam,
        phase_name: phaseNameParam,
        count: photos.length,
        photos,
      });
    }

    // Query 3: Fall back to daily_update_id from database (legacy, for backwards compatibility)
    if (dailyUpdateIdParam && isUuid(dailyUpdateIdParam)) {
      console.log('[Daily Update Photos] Legacy query by daily_update_id:', dailyUpdateIdParam);

      const { data: photoRows, error } = await supabase
        .from('update_photos')
        .select('*')
        .eq('daily_update_id', dailyUpdateIdParam)
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
        daily_update_id: dailyUpdateIdParam,
        count: photos.length,
      });

      return res.status(200).json({
        message: photos.length ? 'Daily update photos retrieved successfully' : 'No photos found for this daily update',
        daily_update_id: dailyUpdateIdParam,
        count: photos.length,
        photos,
      });
    }

    // No valid parameters provided
    return res.status(400).json({
      error: 'Validation error',
      message:
        'Provide either: (project_id + phase_name + daily_update_id), (project_id + phase_name), or (daily_update_id)',
    });
  } catch (error) {
    console.error('[Daily Update Photos] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving photos',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
