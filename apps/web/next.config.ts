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

  async redirects() {
    return [
      {
        source: '/feed',
        destination: '/explore',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
