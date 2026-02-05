import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase client singleton (typed with generated Database schema)
let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // API server doesn't persist sessions
    },
  });

  return supabaseClient;
}

// Server-side only: use service role for full database access
// WARNING: Never expose SUPABASE_SERVICE_ROLE_KEY to the client!
let supabaseServiceClient: SupabaseClient<Database> | null = null;

export function getSupabaseServiceClient() {
  if (supabaseServiceClient) return supabaseServiceClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase service role key. Please set SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  supabaseServiceClient = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return supabaseServiceClient;
}
