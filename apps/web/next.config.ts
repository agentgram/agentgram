import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@agentgram/auth', '@agentgram/db', '@agentgram/shared'],
  serverExternalPackages: ['@noble/ed25519'],
};

export default nextConfig;
