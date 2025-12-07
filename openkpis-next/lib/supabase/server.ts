/**
 * Supabase Client for Server-Side (API Routes, Server Components)
 * Uses unified environment variables (no _DEV suffix)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseServerConfig(usePublishableKey: boolean = true) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  if (usePublishableKey) {
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    if (!url || !publishableKey) {
      throw new Error('[Supabase] Missing server auth envs: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    }
    return { url, key: publishableKey };
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !secretKey) {
    throw new Error('[Supabase] Missing server admin envs: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY');
  }
  return { url, key: secretKey };
}

/**
 * Create Supabase client for server-side operations with user session support
 * Use this in API routes that need to access the current user's session
 */
export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabaseServerConfig(true);

  // Provide both API sets for compatibility with different @supabase/ssr versions
  // Newer versions use getAll/setAll, older versions use get/set/remove
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }>) {
        try {
          cookiesToSet.forEach((cookie) => {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          });
        } catch {
          // ignore in server components
        }
      },
      // Also provide deprecated API for backward compatibility
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // ignore in server components
        }
      },
      remove(name: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        } catch {
          // ignore in server components
        }
      },
    } as unknown as Parameters<typeof createServerClient>[2]['cookies'],
  });
}

/**
 * Create admin Supabase client (bypasses RLS)
 * Use only for server-side admin operations
 * 
 * Note: Using service_role/secret key should automatically bypass RLS,
 * but we explicitly configure the client to ensure no session/auth interference
 */
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Create client with explicit config to ensure RLS bypass
  // service_role key should bypass RLS automatically, but explicit config helps
  return createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
  });
}

