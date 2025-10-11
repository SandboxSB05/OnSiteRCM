import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client using the service role key (only for serverless functions)
const supabaseUrl = process.env.VITE_SUPABASE_URL as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabaseServer: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)
