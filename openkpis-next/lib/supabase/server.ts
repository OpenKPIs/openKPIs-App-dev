/**
 * Supabase Client for Server-Side (API Routes, Server Components)
 * Uses Secret Key (not publishable key) for admin operations
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Get Supabase server configuration
 * For auth operations, use ANON_KEY (publishable key) to preserve user sessions
 * For admin operations, use SECRET_KEY (service role key)
 */
function getSupabaseServerConfig(useAnonKey: boolean = true) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (useAnonKey) {
    // Use anon key for auth operations (preserves user sessions)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      const isVercel = process.env.VERCEL ? 'Vercel Dashboard' : 'environment variables';
      throw new Error(
        `Missing Supabase configuration. ` +
        `Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in ${isVercel}`
      );
    }
    return { url, key: anonKey };
  } else {
    // Use secret key for admin operations (bypasses RLS)
    const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !secretKey) {
      const isVercel = process.env.VERCEL ? 'Vercel Dashboard' : 'environment variables';
      throw new Error(
        `Missing Supabase server configuration. ` +
        `Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in ${isVercel}`
      );
    }
    return { url, key: secretKey };
  }
}

/**
 * Create Supabase client for server-side operations with user session support
 * Use this in API routes that need to access the current user's session
 * 
 * Note: In Next.js 15, cookies() may need to be awaited
 */
export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabaseServerConfig(true); // Use anon key for auth
  
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Create admin Supabase client (bypasses RLS)
 * Use only for server-side admin operations
 */
export function createAdminClient() {
  const config = getSupabaseServerConfig();
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  return createSupabaseClient(config.url, config.key);
}

