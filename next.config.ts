import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
   // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint errors during build
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.thesqua.re',
      },
    ],
  },
};

export default nextConfig;
