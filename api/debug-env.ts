import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Debug endpoint to check environment variables
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return res.status(200).json({
    message: 'Environment variables check',
    variables: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✅' : 'Missing ❌',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌',
    },
    nodeEnv: process.env.NODE_ENV,
  });
}
