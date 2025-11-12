import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUploadRequest } from './uploadCore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Upload API] Handler invoked');
    console.log('[Upload API] Request method:', req.method);
    console.log('[Upload API] Headers:', Object.keys(req.headers));
    
    const { status, body } = await handleUploadRequest(req);
    
    console.log('[Upload API] Handler returned status:', status);
    console.log('[Upload API] Response body keys:', body ? Object.keys(body) : 'null');
    
    return res.status(status).json(body);
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
