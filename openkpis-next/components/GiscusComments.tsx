'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signInWithGitHub, signOut } from '@/lib/supabase/auth';

interface GiscusCommentsProps {
  term?: string;
  category?: string;
}

export default function GiscusComments({ term, category = 'kpis' }: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [giscusLoaded, setGiscusLoaded] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Get GitHub token from session - try multiple ways
      let token = null;
      if (session) {
        // Try provider_token first (GitHub OAuth token)
        token = session.provider_token || 
                session.provider_refresh_token ||
                (session as any).provider_access_token;
        
        // If no provider_token, try to get it from the session metadata
        if (!token && (session as any).provider_token) {
          token = (session as any).provider_token;
        }
      }
      
      setGithubToken(token);
      
      // If Giscus is already loaded and we have a token, update authentication
      if (event === 'SIGNED_IN' && giscusLoaded && token) {
        updateGiscusAuth(token);
      } else if (event === 'SIGNED_OUT') {
        // Sign out of Giscus too
        if (giscusLoaded) {
          updateGiscusAuth(null);
        }
      }
    });

    // Listen for manual sign out events
    const handleSignOut = () => {
      if (giscusLoaded) {
        updateGiscusAuth(null);
      }
    };
    window.addEventListener('openkpis-sign-out', handleSignOut);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('openkpis-sign-out', handleSignOut);
    };
  }, [giscusLoaded]);

  async function checkUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    
    // Get GitHub token if user is signed in
    if (currentUser) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        setGithubToken(session.provider_token);
      }
    }
  }

  function updateGiscusAuth(token: string | null) {
    const iframe = containerRef.current?.querySelector('iframe');
    if (!iframe || !iframe.contentWindow) return;

    try {
      if (token) {
        // Update Giscus with GitHub token
        iframe.contentWindow.postMessage(
          {
            giscus: {
              setConfig: {
                session: token,
              },
            },
          },
          'https://giscus.app'
        );
      } else {
        // Sign out of Giscus
        iframe.contentWindow.postMessage(
          {
            giscus: {
              signOut: true,
            },
          },
          'https://giscus.app'
        );
      }
    } catch (err) {
      console.error('Failed to update Giscus auth:', err);
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing script
    const existingScript = containerRef.current.querySelector('script');
    if (existingScript) {
      existingScript.remove();
    }

    // Clear the container
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'devyendarm/OpenKPIs');
    script.setAttribute('data-repo-id', 'R_kgDOP1g99A');
    script.setAttribute('data-category', 'Q&A');
    script.setAttribute('data-category-id', 'DIC_kwDOP1g99M4CxJez');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');
    
    // Set GitHub token if available (before loading Giscus)
    if (githubToken) {
      script.setAttribute('data-session', githubToken);
    }

    script.async = true;

    // Set up onload handler
    script.onload = () => {
      setGiscusLoaded(true);
      
      // If we have a token, send it to Giscus after it loads
      if (githubToken) {
        setTimeout(() => {
          updateGiscusAuth(githubToken);
        }, 1000);
      }
    };

    containerRef.current.appendChild(script);

    // Listen for messages from Giscus
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;
      
      // Giscus is requesting sign-in
      if (event.data?.giscus?.signIn && !user) {
        // Trigger GitHub OAuth through Supabase
        signInWithGitHub().catch((err) => {
          console.error('Failed to sign in:', err);
        });
      }
      
      // Giscus signed out - sync with Supabase
      if (event.data?.giscus?.signOut && user) {
        signOut().then(() => {
          window.location.reload();
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [term, category, user, githubToken]);

  // Also update Giscus when token changes
  useEffect(() => {
    if (giscusLoaded && githubToken) {
      updateGiscusAuth(githubToken);
    } else if (giscusLoaded && !githubToken && user) {
      // Token might not be available yet, wait a bit
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.provider_token) {
            setGithubToken(session.provider_token);
            updateGiscusAuth(session.provider_token);
          }
        });
      }, 500);
    }
  }, [githubToken, giscusLoaded]);

  return <div ref={containerRef} style={{ marginTop: '3rem' }} />;
}

