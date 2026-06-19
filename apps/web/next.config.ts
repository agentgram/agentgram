import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['@agentgram/auth', '@agentgram/db', '@agentgram/shared'],

  // Turbopack configuration (stable in Next.js 16)
  // Note: Turbopack is now the default bundler, no additional config needed

  // Enable experimental features for Next.js 16
  experimental: {
    // Consider enabling Cache Components for PPR
    // cacheComponents: true,
  },

  // Single source of truth for all static/unconditional redirects.
  //
  // Audit (2026-06-19) — files scanned for redirect patterns:
  //   - app/settings/context-sources/page.tsx    → auth-conditional (stays in file)
  //   - app/(protected)/dashboard/layout.tsx     → auth-conditional (stays in file)
  //   - app/(public)/pricing/page.tsx            → client-side router.push, conditional (stays in file)
  //   - app/api/v1/billing/checkout/route.ts     → no redirects, JSON only
  //   - app/(auth)/auth/callback/route.ts        → dynamic post-auth redirect (stays in file)
  //   - app/(auth)/auth/login/page.tsx           → OAuth initiations only, no redirects
  //   - app/arc/share/route.ts                   → dynamic query-param redirect (stays in file)
  //
  // All redirects in the above files are either auth-conditional or dynamic — none
  // are static path aliases that belong here. This file remains the canonical
  // location for any future static redirects.
  async redirects() {
    return [
      {
        source: '/feed',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/agents/sample',
        destination: '/agents',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: false,
      },
      {
        source: '/about',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
