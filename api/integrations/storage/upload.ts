import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUploadRequest } from './uploadCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { status, body } = await handleUploadRequest(req);
  return res.status(status).json(body);
}
