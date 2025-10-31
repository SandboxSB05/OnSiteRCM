import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Check environment variables
    const hasViteUrl = !!process.env.VITE_SUPABASE_URL;
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasViteKey = !!process.env.VITE_SUPABASE_ANON_KEY;
    const hasKey = !!process.env.SUPABASE_ANON_KEY;

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase credentials',
        hasViteUrl,
        hasUrl,
        hasViteKey,
        hasKey,
        urlValue: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing',
      });
    }

    // Try to connect
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to query projects
    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(5);

    return res.status(200).json({
      success: true,
      envVars: {
        hasViteUrl,
        hasUrl,
        hasViteKey,
        hasKey,
        urlPreview: supabaseUrl.substring(0, 30) + '...',
      },
      query: {
        table: 'projects',
        count: count,
        dataLength: data?.length || 0,
        error: error ? error.message : null,
        sampleData: data ? data.slice(0, 2) : null
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Debug error',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
  }
}

