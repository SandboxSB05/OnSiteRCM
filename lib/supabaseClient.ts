import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client using the anon key (safe for browser)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

console.log('[Supabase Init]', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  keyStart: supabaseAnonKey?.substring(0, 20),
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
