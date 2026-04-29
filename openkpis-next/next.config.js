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
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors or warnings, preventing Vercel build failures.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors, preventing Vercel build failures.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
