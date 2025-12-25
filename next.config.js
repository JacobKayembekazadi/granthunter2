/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify removed - deprecated in Next.js 15
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: [],
  },
  // Note: Environment variables are handled by Vercel
  // Don't expose sensitive keys via env config
  env: {
    // Only expose public env vars here if needed
  },
};

module.exports = nextConfig;

