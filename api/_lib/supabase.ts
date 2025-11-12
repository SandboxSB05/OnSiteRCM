import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both SUPABASE_* and VITE_SUPABASE_* environment variables
// This ensures compatibility with both Vercel and local dev environments
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[SUPABASE] Initialization:');
console.log('  SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
console.log('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
console.log('  Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '));

if (!SUPABASE_URL) {
  console.error('[SUPABASE] Missing SUPABASE_URL. Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL must be defined');
}

if (!SUPABASE_ANON_KEY) {
  console.error('[SUPABASE] Missing SUPABASE_ANON_KEY. Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  throw new Error('SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY must be defined');
}

/**
 * Create a Supabase client for user-scoped operations with RLS enabled
 * 
 * This client uses the anon key and forwards the user's access token,
 * allowing RLS policies to identify the user via auth.uid().
 * 
 * @param accessToken - The user's Supabase access token from the Authorization header
 * @returns A Supabase client configured for user-scoped operations
 */
export function supabaseUserClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Create a Supabase client with service role privileges (bypasses RLS)
 * 
 * ⚠️ WARNING: Only use this for admin-only operations!
 * Never combine this with untrusted client inputs as it bypasses all RLS policies.
 * 
 * @returns A Supabase client with service role privileges
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not configured
 */
export function supabaseAdminClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be configured for admin operations');
  }

  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
