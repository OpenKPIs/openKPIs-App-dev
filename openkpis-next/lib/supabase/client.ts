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

    // ── DEV BYPASS ─────────────────────────────────────────────────────────────
    if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
      const mockUser = { id: '11111111-1111-1111-1111-111111111111', email: 'dev@localhost.local', user_metadata: { user_name: 'dev-user' }, app_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
      const mockSession = { access_token: 'dev-token', refresh_token: 'dev-refresh', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: mockUser };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabaseClient.auth.getUser = async (...args: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { data: { user: mockUser as any }, error: null };
      };
      
      supabaseClient.auth.getSession = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { data: { session: mockSession as any }, error: null };
      };
    }
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