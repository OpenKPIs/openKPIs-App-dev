'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the code from URL
      const code = searchParams.get('code');
      
      if (code) {
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
          // Get return URL from sessionStorage or default to home
          const returnUrl = sessionStorage.getItem('openkpis_return_url') || '/';
          sessionStorage.removeItem('openkpis_return_url');
          
          // Redirect to the original page
          router.push(returnUrl);
        } else {
          console.error('Error exchanging code:', error);
          router.push('/');
        }
      } else {
        router.push('/');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <p>Completing sign in...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p>Preparing sign in...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

