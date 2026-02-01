import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client (singleton)
let supabaseBrowserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (supabaseBrowserClient) {
    return supabaseBrowserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // No auth session persistence for public read-only access
      autoRefreshToken: false,
    },
  });

  return supabaseBrowserClient;
}
