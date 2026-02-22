import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Image Optimization ─────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Keep heavy server-only packages out of the client bundle ───────────
  serverExternalPackages: ['pdf2json', 'mammoth', 'qrcode'],

  // ── Compiler optimizations ─────────────────────────────────────────────
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── HTTP response headers ──────────────────────────────────────────────
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(png|jpg|jpeg|svg|ico|webp|avif|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Never cache API routes
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
