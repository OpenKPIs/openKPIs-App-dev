/**
 * Supabase Client for Browser
 * Uses unified environment variables (no _DEV suffix)
 */

import { createBrowserClient } from '@supabase/ssr';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    console.warn('[Supabase] Missing env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required. Using placeholders.');
    return { url: 'https://placeholder.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy' };
  }
  return { url, key: publishableKey };
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function syncSessionFromCookie() {
  if (typeof window === 'undefined') return;
  const { url } = getSupabaseConfig();
  let projectRef: string | null = null;
  try {
    const parsed = new URL(url);
    projectRef = parsed.host.split('.')[0] || null;
  } catch {
    return;
  }
  if (!projectRef) return;

  const storageKey = `sb-${projectRef}-auth-token`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    try {
      JSON.parse(existing);
      return; // already in expected JSON format
    } catch {
      // fall through to attempt to repair from cookie
    }
  }

  const cookieMatch = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${storageKey}=`));
  if (!cookieMatch) return;

  const rawValue = decodeURIComponent(cookieMatch.split('=')[1] || '');
  let parsedJson: string | null = null;

  if (rawValue.startsWith('base64-')) {
    const base64Payload = rawValue.slice('base64-'.length);
    try {
      const decoded = atob(base64Payload);
      JSON.parse(decoded);
      parsedJson = decoded;
    } catch {
      // ignore – decoding failed
    }
  } else {
    try {
      JSON.parse(rawValue);
      parsedJson = rawValue;
    } catch {
      // ignore – not valid JSON
    }
  }

  if (parsedJson) {
    window.localStorage.setItem(storageKey, parsedJson);
  }
}

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in client components');
  }

  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();
    syncSessionFromCookie();
    supabaseClient = createBrowserClient(url, key);
  }

  return supabaseClient;
}

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