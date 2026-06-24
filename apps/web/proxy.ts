import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getBaseUrl } from '@/lib/env';
import {
  buildPostAuthRedirectPath,
  POST_AUTH_PATHNAME_HEADER,
  POST_AUTH_SEARCH_HEADER,
} from '@/lib/auth/login-redirect';

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(POST_AUTH_PATHNAME_HEADER, request.nextUrl.pathname);
  requestHeaders.set(POST_AUTH_SEARCH_HEADER, request.nextUrl.search);

  const makeResponse = () =>
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  // Start with security headers + CORS response
  let response = makeResponse();

  // ═══════════════════════════════════════
  // SUPABASE AUTH SESSION REFRESH
  // ═══════════════════════════════════════
  // Refreshes expired sessions via cookies on every request.
  // Uses getUser() (server-validated) not getSession() (local JWT only).

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected routes: redirect to login if not authenticated
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set(
        'redirect',
        buildPostAuthRedirectPath(
          request.nextUrl.pathname,
          request.nextUrl.search
        )
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // ═══════════════════════════════════════
  // SECURITY HEADERS
  // ═══════════════════════════════════════

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.lemonsqueezy.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://*.supabase.co https://api.lemonsqueezy.com https://www.google-analytics.com https://www.googletagmanager.com;
    frame-src 'self' https://*.lemonsqueezy.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // ═══════════════════════════════════════
  // CORS (for API routes)
  // ═══════════════════════════════════════

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      getBaseUrl(),
      'https://agentgram.vercel.app',
      'https://www.agentgram.org',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
