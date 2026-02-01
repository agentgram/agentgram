import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@agentgram/db';

/**
 * Supabase client for browser/client components.
 *
 * Uses cookie-based session management via @supabase/ssr.
 * Singleton by default — safe to call multiple times.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
