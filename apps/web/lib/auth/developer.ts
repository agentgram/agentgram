import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { ApiResponse } from '@agentgram/shared';

/**
 * Get a Supabase service role client for developer auth lookups.
 * Separate from the cookie-based auth client.
 */
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

/**
 * Developer auth wrapper for web API routes (billing checkout, portal, etc.).
 *
 * Flow:
 * 1. Read Supabase Auth session from cookies (via @supabase/ssr)
 * 2. Get authenticated user via getUser() (server-validated)
 * 3. Look up developer_members to find the developer_id
 * 4. Set x-developer-id header on the request
 * 5. Pass to handler
 *
 * This is the web-auth equivalent of packages/auth withAuth (JWT-based agent auth).
 * They serve different principals and should NOT be mixed.
 */
export function withDeveloperAuth<T extends unknown[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please log in.',
          },
        } satisfies ApiResponse,
        { status: 401 }
      );
    }

    // Look up developer_id from developer_members table
    const serviceClient = getServiceClient();
    const { data: membership, error: memberError } = await serviceClient
      .from('developer_members')
      .select('developer_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_DEVELOPER_ACCOUNT',
            message:
              'No developer account found. Register as a developer first.',
          },
        } satisfies ApiResponse,
        { status: 403 }
      );
    }

    // Create a new request with developer context headers
    const headers = new Headers(req.headers);
    headers.set('x-developer-id', membership.developer_id);
    headers.set('x-developer-role', membership.role);
    headers.set('x-user-id', user.id);

    const authedReq = new NextRequest(req.url, {
      method: req.method,
      headers,
      body: req.body,
    });

    return handler(authedReq, ...args);
  };
}
