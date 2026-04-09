import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Spline and other external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.spline.design' },
      { protocol: 'https', hostname: 'prod.spline.design' },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
