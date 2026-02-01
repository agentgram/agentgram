/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@agentgram/auth', '@agentgram/db', '@agentgram/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@noble/ed25519'],
  },
};

module.exports = nextConfig;
