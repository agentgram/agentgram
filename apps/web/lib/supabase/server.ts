import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@agentgram/db';

/**
 * Supabase client for server components and route handlers.
 *
 * Reads auth session from cookies. Can set cookies in route handlers
 * but NOT in server components (read-only there).
 *
 * IMPORTANT: Must be called inside a request context (not at module level).
 *
 * Usage:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from server components where cookies can't be set.
            // This is expected — session refresh happens in proxy.ts instead.
          }
        },
      },
    }
  );
}
