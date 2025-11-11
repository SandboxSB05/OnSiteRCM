import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUploadRequest } from './uploadCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { status, body } = await handleUploadRequest(req);
    return res.status(status).json(body);
  } catch (error) {
    console.error('[Upload Handler Error]', error);
    return res.status(500).json({
      error: 'Upload handler crashed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
