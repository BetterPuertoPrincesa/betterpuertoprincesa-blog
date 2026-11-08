import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Cover photos live in Vercel Blob. They're resized on upload and
    // rendered with `unoptimized`, so this only allowlists the host.
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  // Logos and icons rarely change; let browsers keep them for a week.
  async headers() {
    return [
      {
        source:
          '/:file(logos/.*|favicon.*|apple-touch-icon.png|web-app-manifest-.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
