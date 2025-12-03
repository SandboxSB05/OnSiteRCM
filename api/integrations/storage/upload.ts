import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import busboy from '@fastify/busboy';
import { randomUUID } from 'crypto';

// Helper to get environment variables lazily
// All upload logic inlined - no external dependencies
const getConfig = () => ({
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'relay_photos',
  maxUploadBytes: Number(process.env.FILE_UPLOAD_MAX_BYTES || 10 * 1024 * 1024),
  maxFilesPerRequest: Number(process.env.FILE_UPLOAD_MAX_FILES || 10),
  allowedMimePrefixes: (process.env.FILE_UPLOAD_ALLOWED_MIME_PREFIXES || 'image/')
    .split(',')
    .map((prefix) => prefix.trim())
    .filter(Boolean),
});

type ParsedFile = {
  fieldname: string;
  filename: string;
  encoding: string;
  mimeType: string;
  size: number;
  data: Buffer;
};

type ParsedForm = {
  files: ParsedFile[];
  fields: Record<string, string>;
};

const isAllowedMimeType = (mimeType?: string | null) => {
  const { allowedMimePrefixes } = getConfig();
  if (!mimeType) {
    return false;
  }
  if (allowedMimePrefixes.length === 0) {
    return true;
  }
  return allowedMimePrefixes.some((prefix) =>
    prefix.endsWith('/') ? mimeType.startsWith(prefix) : mimeType === prefix
  );
};

const getMimeTypeFromExtension = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  };
  return mimeMap[ext] || 'application/octet-stream';
};

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

const buildFolder = (fields: Record<string, string>) => {
  const projectId = 
    fields.project_id || 
    fields.projectId || 
    fields.project_folder;
  
  const phaseName = 
    fields.phase_name || 
    fields.phaseName || 
    fields.project_phase ||
    fields.projectPhase;

  const dailyUpdateId =
    fields.daily_update_id ||
    fields.dailyUpdateId ||
    fields.daily_updates_id ||
    fields.dailyUpdatesId;

  if (projectId && phaseName && dailyUpdateId) {
    const sanitizedProjectId = sanitizePathSegment(projectId);
    const sanitizedPhaseName = sanitizePathSegment(phaseName);
    const sanitizedDailyUpdateId = sanitizePathSegment(dailyUpdateId);
    if (sanitizedProjectId && sanitizedPhaseName && sanitizedDailyUpdateId) {
      return `${sanitizedProjectId}/${sanitizedPhaseName}/${sanitizedDailyUpdateId}`;
    }
  }

  if (projectId && phaseName) {
    const sanitizedProjectId = sanitizePathSegment(projectId);
    const sanitizedPhaseName = sanitizePathSegment(phaseName);
    if (sanitizedProjectId && sanitizedPhaseName) {
      return `${sanitizedProjectId}/${sanitizedPhaseName}`;
    }
  }

  const rawFolder =
    fields.folder ||
    projectId ||
    'uploads';

  const folder = sanitizePathSegment(rawFolder);
  if (folder) {
    return folder;
  }
  return 'uploads';
};

const createUniqueFilename = (originalName?: string) => {
  const fallbackName = 'photo';
  if (!originalName) {
    return `${fallbackName}-${randomUUID()}`;
  }

  const extensionMatch = originalName.match(/\.([0-9a-zA-Z]+)$/);
  const extension = extensionMatch ? `.${extensionMatch[1].toLowerCase()}` : '';
  const base = originalName.replace(/\.[^/.]+$/, '');
  const normalizedBase = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const truncatedBase = normalizedBase ? normalizedBase.slice(0, 48) : fallbackName;
  return `${truncatedBase}-${Date.now()}-${randomUUID()}${extension}`;
};

const parseMultipartForm = (req: VercelRequest): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || req.headers['Content-Type'];
    console.log('[Parse Multipart] Content-Type:', contentType);
    
    if (!contentType || typeof contentType !== 'string' || !contentType.toLowerCase().includes('multipart/form-data')) {
      console.error('[Parse Multipart] Invalid content-type:', contentType);
      reject(new Error('Content-Type must be multipart/form-data'));
      return;
    }

    const normalizedHeaders: any = {};
    Object.keys(req.headers).forEach(key => {
      normalizedHeaders[key.toLowerCase()] = req.headers[key];
    });

    console.log('[Parse Multipart] Normalized headers:', normalizedHeaders);

    const { maxUploadBytes, maxFilesPerRequest } = getConfig();

    const bb = busboy({
      headers: normalizedHeaders,
      limits: {
        files: maxFilesPerRequest,
        fileSize: maxUploadBytes,
      },
    });

    const files: ParsedFile[] = [];
    const fields: Record<string, string> = {};

    bb.on('file', (name: string, fileStream: any, info: any) => {
      console.log('[Parse Multipart] File event fired');
      console.log('[Parse Multipart] fieldname:', name);
      console.log('[Parse Multipart] info (type):', typeof info);
      console.log('[Parse Multipart] info (value):', info);
      
      let filename = typeof info === 'string' ? info : info?.filename;
      let mimeType = info?.mimeType;
      let encoding = info?.encoding || '7bit';
      
      console.log(`[Parse Multipart] Parsed: filename="${filename}", mimeType="${mimeType}"`);
      
      if (!filename || filename.trim() === '') {
        console.log(`[Parse Multipart] Invalid filename, generating fallback for field: ${name}`);
        filename = `${name}-${Date.now()}`;
      }
      
      if (!mimeType) {
        mimeType = getMimeTypeFromExtension(filename);
        console.log(`[Parse Multipart] Inferred mimeType from filename: ${mimeType}`);
      }
      
      const chunks: Buffer[] = [];
      let fileSize = 0;

      fileStream.on('data', (chunk: Buffer) => {
        fileSize += chunk.length;
        if (fileSize > maxUploadBytes) {
          bb.emit(
            'error',
            new Error(
              `File "${filename}" exceeds max upload size of ${Math.round(
                maxUploadBytes / (1024 * 1024)
              )}MB`
            )
          );
          fileStream.resume();
          return;
        }
        chunks.push(chunk);
      });

      fileStream.once('end', () => {
        files.push({
          fieldname: name,
          filename,
          encoding,
          mimeType,
          size: fileSize,
          data: Buffer.concat(chunks),
        });
      });
    });

    bb.on('field', (name: string, value: string) => {
      fields[name] = value;
    });

    bb.once('filesLimit', () => {
      reject(new Error(`Too many files uploaded. Limit is ${maxFilesPerRequest}`));
    });

    bb.once('error', (error: Error) => {
      console.error('Busboy error:', error);
      reject(error);
    });

    bb.once('finish', () => {
      console.log(`[Parse Multipart] Form parsing complete: ${files.length} files, fields:`, Object.keys(fields));
      resolve({ files, fields });
    });

    req.pipe(bb);
  });
};

const parseAuthToken = async (req: VercelRequest) => {
  const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;

  if (!authHeader) {
    return { error: 'Missing authorization token' };
  }

  try {
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice('Bearer '.length).trim();
      console.log('[Auth] Stripped Bearer prefix from authorization header');
    } else {
      console.log('[Auth] Token received without Bearer prefix, using as-is');
    }

    if (!token) {
      return { error: 'Missing or invalid authorization token' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid token format' };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

    if (!payload?.sub) {
      return { error: 'Token missing user ID' };
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { error: 'Token expired' };
    }

    return { payload: { userId: payload.sub, token } };
  } catch (error) {
    console.error('[Token Parse Error]', error);
    return { error: 'Invalid token format' };
  }
};

const uploadFilesToSupabase = async (
  supabase: SupabaseClient,
  folder: string,
  files: ParsedFile[],
  bucket: string
) => {
  const uploads = [];

  for (const file of files) {
    if (!isAllowedMimeType(file.mimeType)) {
      throw new Error(`Unsupported file type: ${file.mimeType || 'unknown'}`);
    }

    const filename = createUniqueFilename(file.filename);
    const storagePath = `${folder}/${filename}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(
      storagePath,
      file.data,
      {
        contentType: file.mimeType || 'application/octet-stream',
        upsert: false,
      }
    );

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const publicUrl = publicUrlData?.publicUrl || null;

    uploads.push({
      originalName: file.filename,
      fileName: filename,
      bucket,
      path: storagePath,
      folder,
      size: file.size,
      mimeType: file.mimeType,
      uploadedAt: new Date().toISOString(),
      publicUrl,
      file_url: publicUrl,
      url: publicUrl,
    });
  }

  return uploads;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getFieldValue = (fields: Record<string, string>, keys: string[]): string | undefined => {
  if (!fields || Object.keys(fields).length === 0) {
    return undefined;
  }

  const normalizedEntries = Object.entries(fields).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  for (const key of keys) {
    const normalizedKey = key.toLowerCase();
    if (normalizedEntries.hasOwnProperty(normalizedKey)) {
      return normalizedEntries[normalizedKey];
    }
  }

  return undefined;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Upload API] Handler invoked');
    console.log('[Upload API] Request method:', req.method);
    console.log('[Upload API] Headers:', Object.keys(req.headers));
    
    // Get config lazily to support dev server middleware
    const config = getConfig();
    const { supabaseUrl, supabaseServiceRoleKey, storageBucket: bucket } = config;
    
    if ((req.method || '').toUpperCase() !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests',
      });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      const missing = [];
      if (!supabaseUrl) missing.push('SUPABASE_URL or VITE_SUPABASE_URL');
      if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      
      console.error('Missing Supabase credentials:', missing.join(', '));
      return res.status(500).json({
        error: 'Server misconfiguration',
        message: `Missing Supabase credentials: ${missing.join(', ')}`,
      });
    }

    const { payload, error: authError } = await parseAuthToken(req);
    if (authError || !payload) {
      return res.status(401).json({ error: 'Unauthorized', message: authError });
    }

    const { files, fields } = await parseMultipartForm(req);

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one file must be provided',
      });
    }

    const { maxFilesPerRequest } = getConfig();
    if (files.length > maxFilesPerRequest) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Too many files uploaded. Limit is ${maxFilesPerRequest}`,
      });
    }

    const folder = buildFolder(fields);
    const dailyUpdateId =
      (
        getFieldValue(fields, [
          'daily_update_id',
          'dailyUpdateId',
          'daily_updates_id',
          'dailyUpdatesId',
          'daily_updateID',
          'dailyUpdateID',
        ]) || ''
      ).trim();

    if (dailyUpdateId && !isUuid(dailyUpdateId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'daily_update_id must be a valid UUID',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const uploads = await uploadFilesToSupabase(supabase, folder, files, bucket);

    let photoRecords: any[] | null = null;
    if (dailyUpdateId) {
      console.log('[Upload API] Linking uploads to daily_update_id:', dailyUpdateId);
      const rows = uploads.map((upload) => ({
        daily_update_id: dailyUpdateId,
        storage_bucket: upload.bucket,
        storage_path: upload.path,
        uploaded_by: payload.userId,
      }));

      const { data, error } = await supabase.from('update_photos').insert(rows).select('*');
      if (error) {
        throw new Error(`Failed to record photo metadata: ${error.message}`);
      }
      photoRecords = data || [];
    }

    console.log('[Upload API] Files uploaded successfully', {
      userId: payload.userId,
      count: uploads.length,
      folder,
      bucket,
    });

    return res.status(200).json({
      success: true,
      bucket,
      count: uploads.length,
      uploads,
      photo_records: photoRecords,
    });
  } catch (error) {
    console.error('[Upload Handler Error]', error);
    console.error('[Upload Handler Error] Stack:', error instanceof Error ? error.stack : 'no stack');
    return res.status(500).json({
      error: 'Upload handler crashed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.toString() : String(error),
    });
  }
}
