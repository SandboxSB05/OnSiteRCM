import { createClient } from '@supabase/supabase-js';
import busboy from '@fastify/busboy';
import { randomUUID } from 'crypto';
import type { IncomingMessage } from 'http';

// Helper to get environment variables lazily (for dev server middleware compatibility)
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

// Keep these for backward compatibility
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'relay_photos';

const maxUploadBytes =
  Number(process.env.FILE_UPLOAD_MAX_BYTES || 10 * 1024 * 1024); // 10MB default
const maxFilesPerRequest = Number(process.env.FILE_UPLOAD_MAX_FILES || 10);
const allowedMimePrefixes = (process.env.FILE_UPLOAD_ALLOWED_MIME_PREFIXES || 'image/')
  .split(',')
  .map((prefix) => prefix.trim())
  .filter(Boolean);

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
  const rawFolder =
    fields.folder ||
    fields.project_folder ||
    fields.projectId ||
    fields.project_id ||
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

const parseMultipartForm = (req: IncomingMessage): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || req.headers['Content-Type'];
    if (!contentType || typeof contentType !== 'string' || !contentType.toLowerCase().includes('multipart/form-data')) {
      console.error('Invalid content-type:', contentType);
      reject(new Error('Content-Type must be multipart/form-data'));
      return;
    }

    // Normalize headers for busboy compatibility
    const normalizedHeaders: any = {};
    Object.keys(req.headers).forEach(key => {
      normalizedHeaders[key.toLowerCase()] = req.headers[key];
    });

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
      const filename = info.filename as string;
      const encoding = info.encoding as string;
      const mimeType = info.mimeType as string;
      
      if (!filename) {
        fileStream.resume();
        return;
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
      console.log(`Multipart form parsed: ${files.length} files`);
      resolve({ files, fields });
    });

    req.pipe(bb);
  });
};

const parseAuthToken = (req: IncomingMessage) => {
  const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;

  if (!authHeader.startsWith('Bearer.')) {
    return { error: 'Missing or invalid authorization token' };
  }

  try {
    const base64 = authHeader.split('Bearer.')[1];
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(json);

    if (!payload?.userId || !payload?.exp || Date.now() > payload.exp) {
      return { error: 'Token expired or invalid' };
    }

    return { payload };
  } catch (error) {
    return { error: 'Invalid token format' };
  }
};

const uploadFilesToSupabase = async (
  supabase: ReturnType<typeof createClient>,
  folder: string,
  files: ParsedFile[]
) => {
  const uploads = [];

  for (const file of files) {
    if (!isAllowedMimeType(file.mimeType)) {
      throw new Error(`Unsupported file type: ${file.mimeType || 'unknown'}`);
    }

    const filename = createUniqueFilename(file.filename);
    const storagePath = `${folder}/${filename}`;

    const { error: uploadError } = await supabase.storage.from(storageBucket).upload(
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

    const { data: publicUrlData } = supabase.storage.from(storageBucket).getPublicUrl(storagePath);
    const publicUrl = publicUrlData?.publicUrl || null;

    uploads.push({
      originalName: file.filename,
      fileName: filename,
      bucket: storageBucket,
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

export type UploadHandlerResult = {
  status: number;
  body: Record<string, any>;
};

export const handleUploadRequest = async (req: IncomingMessage): Promise<UploadHandlerResult> => {
  // Get config lazily to support dev server middleware
  const config = getConfig();
  const { supabaseUrl, supabaseServiceRoleKey, storageBucket: bucket, maxUploadBytes: maxBytes, maxFilesPerRequest: maxFiles, allowedMimePrefixes: mimePrefix } = config;
  
  if ((req.method || '').toUpperCase() !== 'POST') {
    return {
      status: 405,
      body: {
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests',
      },
    };
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL or VITE_SUPABASE_URL');
    if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    
    console.error('Missing Supabase credentials:', missing.join(', '));
    console.error('Available env vars:', {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    return {
      status: 500,
      body: {
        error: 'Server misconfiguration',
        message: `Missing Supabase credentials: ${missing.join(', ')}`,
      },
    };
  }

  const { payload, error: authError } = parseAuthToken(req);
  if (authError || !payload) {
    return {
      status: 401,
      body: { error: 'Unauthorized', message: authError },
    };
  }

  try {
    const { files, fields } = await parseMultipartForm(req);

    if (!files || files.length === 0) {
      return {
        status: 400,
        body: {
          error: 'Validation error',
          message: 'At least one file must be provided',
        },
      };
    }

    if (files.length > maxFiles) {
      return {
        status: 400,
        body: {
          error: 'Validation error',
          message: `Too many files uploaded. Limit is ${maxFiles}`,
        },
      };
    }

    const folder = buildFolder(fields);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const uploads = await uploadFilesToSupabase(supabase, folder, files);

    console.log('Uploaded files to Supabase Storage', {
      userId: payload.userId,
      count: uploads.length,
      folder,
      bucket,
    });

    return {
      status: 200,
      body: {
        success: true,
        bucket,
        count: uploads.length,
        uploads,
      },
    };
  } catch (error) {
    console.error('File upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const lowerMessage = message.toLowerCase();
    const isValidationError =
      lowerMessage.includes('multipart') ||
      lowerMessage.includes('file') ||
      lowerMessage.includes('too many') ||
      lowerMessage.includes('unsupported') ||
      lowerMessage.includes('limit') ||
      lowerMessage.includes('exceeds');

    return {
      status: isValidationError ? 400 : 500,
      body: {
        error: isValidationError ? 'Validation error' : 'Upload failed',
        message,
      },
    };
  }
};
