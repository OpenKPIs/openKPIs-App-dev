/**
 * Supabase Client for Browser
 * Uses new Publishable Key naming (not legacy anon key)
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Get Supabase configuration based on environment
 * 
 * Environment Detection:
 * - Development: localhost, 127.0.0.1, 192.168.*, 10.*, *.local
 * - Production: openkpis.org or any other production domain
 * 
 * This function should only be called at runtime (client-side)
 */
function getSupabaseConfig() {
  // This should never run during build/SSR, but just in case:
  if (typeof window === 'undefined') {
    // During build/SSR, return production config or empty (support both naming conventions)
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  // Client-side runtime: detect from URL
  const hostname = window.location.hostname;
  const isDev = hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.') ||
                hostname.includes('.local');
  
  if (isDev) {
    // Development environment - support both old (ANON_KEY) and new (PUBLISHABLE_KEY) naming
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL_DEV || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV 
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV 
      || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      // Only warn, don't throw - use production keys as fallback
      console.warn(
        '[Supabase] Missing development configuration. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL_DEV and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV (or NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV) for separate dev instance.'
      );
      // Fallback to production keys
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      };
    }
    
    return { url, key };
  }
  
  // Production environment - support both naming conventions
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn(
      '[Supabase] Missing configuration. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
    return { url: '', key: '' };
  }
  
  return { url, key };
}

/**
 * Supabase client for browser-side operations
 * Use this in client components
 * 
 * Note: Client is created lazily to avoid issues during build time
 */
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: return a mock or throw
    throw new Error('Supabase client can only be used in client components');
  }

  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();
    
    if (!url || !key) {
      throw new Error(
        'Supabase configuration is missing. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
      );
    }

    supabaseClient = createBrowserClient(url, key);
  }

  return supabaseClient;
}

// Export a getter that lazily creates the client
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof typeof client];
    
    if (typeof value === 'function') {
      return value.bind(client);
    }
    
    return value;
  },
});

