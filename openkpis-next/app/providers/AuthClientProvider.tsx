'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserRoleClient } from '@/lib/roles/client';

type AuthContextValue = {
  user: User | null;
  role: 'admin' | 'editor' | 'contributor';
  loading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: 'contributor',
  loading: true,
  refresh: () => {},
});

type AuthClientProviderProps = {
  children: React.ReactNode;
  initialSession: Session | null;
  initialUser: User | null;
  initialRole: 'admin' | 'editor' | 'contributor';
};

export default function AuthClientProvider({
  children,
  initialSession,
  initialUser,
  initialRole,
}: AuthClientProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [role, setRole] = useState<'admin' | 'editor' | 'contributor'>(initialRole);
  const [loading, setLoading] = useState(!initialSession);
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Check for auth success flag in URL (from OAuth callback)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('_auth_success') === '1') {
            // Remove the flag from URL
            urlParams.delete('_auth_success');
            const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash;
            window.history.replaceState({}, '', newUrl);
            
            // Force a session refresh after OAuth callback and load a validated user
            const { data: sessionData } = await supabase.auth.getSession();
            const { data: userData } = await supabase.auth.getUser();

            if (mounted) {
              const nextUser = userData.user ?? sessionData.session?.user ?? null;
              setUser(nextUser);
              try {
                if (nextUser) {
                  const r = await getUserRoleClient();
                  if (mounted) setRole(r);
                } else {
                  setRole('contributor');
                }
              } catch (err) {
                console.error('Error resolving user role after sign-in:', err);
                if (mounted) setRole('contributor');
              }
              setLoading(false);
              return;
            }
          }
        }
        
        if (initialSession?.access_token && initialSession?.refresh_token) {
          try {
            await supabase.auth.setSession({
              access_token: initialSession.access_token,
              refresh_token: initialSession.refresh_token,
            });
          } catch (err) {
            console.error('Error applying Supabase session on client:', err);
          }
        }

        if (!initialSession) {
          // No server session was provided; ask Supabase for the current session and user.
          const [{ data: sessionData }, { data: userData }] = await Promise.all([
            supabase.auth.getSession(),
            supabase.auth.getUser(),
          ]);
          if (!mounted) return;

          const currentUser = userData.user ?? sessionData.session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            const r = await getUserRoleClient();
            if (!mounted) return;
            setRole(r);
          } else {
            setRole('contributor');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        let r: 'admin' | 'editor' | 'contributor' = 'contributor';
        try {
          r = await getUserRoleClient();
        } catch (err) {
          console.error('Error resolving user role (client):', err);
        }
        setRole(r);
      } else {
        setRole('contributor');
      }
      setRefreshTick((v) => v + 1);
      window.dispatchEvent(new CustomEvent('openkpis-auth-change', { detail: { user: nextUser } }));
    });

    return () => {
      sub.subscription.unsubscribe();
      mounted = false;
    };
    // we only need to run this once for the initial session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => {
    setRefreshTick((v) => v + 1);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      refresh,
    }),
    [user, role, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

