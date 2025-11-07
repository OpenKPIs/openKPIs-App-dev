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
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

export async function signInWithGitHub() {
  // Save the current page URL to redirect back after OAuth
  if (typeof window !== 'undefined') {
    const returnUrl = window.location.pathname + window.location.search + window.location.hash;
    sessionStorage.setItem('openkpis_return_url', returnUrl);
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
        prompt: 'consent',
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

