import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Define the domains that are allowed to serve images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },/* config options here */
};

export default nextConfig;
