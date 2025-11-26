/**
 * Supabase Auth Helpers
 * Re-exported functions from Docusaurus implementation
 */

import { supabase } from './client';

export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function getCurrentUser() {
  // Avoid noisy "Auth session missing!" errors by checking session first
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Ignore missing-session specific error; we already checked above
    const err = error as { name?: string; message?: string };
    const name = err.name || '';
    const msg = err.message || '';
    const isMissingSession =
      name === 'AuthSessionMissingError' ||
      msg.toLowerCase().includes('auth session missing');
    if (!isMissingSession) console.error('Error getting user:', error);
    return null;
  }
  return user;
}

export async function signInWithGitHub() {
  // Save the current page URL to redirect back after OAuth
  if (typeof window !== 'undefined') {
    const returnUrl = window.location.pathname + window.location.search + window.location.hash;
    sessionStorage.setItem('openkpis_return_url', returnUrl);
    try {
      // Also set a short-lived cookie so the server callback can read it for instant redirect
      document.cookie = `openkpis_return_url=${encodeURIComponent(returnUrl)}; Path=/; Max-Age=600; SameSite=Lax`;
    } catch {}
  }

  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
      scopes: 'read:user user:email public_repo',
      queryParams: {
        access_type: 'offline',
        // Force GitHub to show account selection screen, allowing users to switch accounts
        // This is the enterprise-standard way to handle account switching
        prompt: 'select_account',
      },
    },
  });
  
  if (error) {
    console.error('Error signing in with GitHub:', error);
    return { error };
  }
  
  return { data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }
  return { success: true };
}

export const STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

