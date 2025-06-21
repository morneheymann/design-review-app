import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Netlify compatibility
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
