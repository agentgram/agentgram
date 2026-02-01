/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@agentgram/auth', '@agentgram/db', '@agentgram/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@noble/ed25519'],
  },
  // Security: Limit request body size to prevent DoS
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

module.exports = nextConfig;
