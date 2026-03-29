/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Strip console.* calls in production bundles (keep console.error)
    removeConsole: { exclude: ['error'] },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  serverExternalPackages: ['duckdb', '@mapbox/node-pre-gyp'],
  env: {
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },
};

module.exports = nextConfig;
