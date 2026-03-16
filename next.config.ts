import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    typedEnv: true,
  },
  typedRoutes: true,
  images: {
    remotePatterns: [{ hostname: 'picsum.photos' }],
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  compiler: {
    removeConsole: {
      exclude: ['error', 'debug', 'table'],
    },
  },
};

export default nextConfig;
