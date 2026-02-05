import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@agentgram/db';

/**
 * Supabase client for browser/client components.
 *
 * Uses cookie-based session management via @supabase/ssr.
 * Singleton — safe to call multiple times without creating duplicate instances.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
