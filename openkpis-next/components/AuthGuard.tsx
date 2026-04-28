'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthClientProvider';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-muted, #6b7280)', marginBottom: '2rem' }}>
          This feature is restricted to logged-in users. Please sign in with GitHub to access the Analytics Planner and AI Analyst tools.
        </p>
        <button
          onClick={() => {
            supabase.auth.signInWithOAuth({
              provider: 'github',
              options: { redirectTo: window.location.origin + window.location.pathname + '?_auth_success=1' }
            });
          }}
          style={{
            background: 'var(--ifm-color-primary, #2563eb)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
