import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3100', 'ww.mainecleaning.company'],
    },
  },
};

export default nextConfig;
