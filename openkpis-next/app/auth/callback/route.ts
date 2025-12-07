import { NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  const requestCookies = await nextCookies();

  // Handle OAuth errors from Supabase/GitHub
  if (error) {
    console.error('[auth/callback] OAuth error:', {
      error,
      errorDescription,
      url: url.toString(),
    });
    
    // Redirect to home with error message
    const redirectUrl = new URL('/', url.origin);
    redirectUrl.searchParams.set('auth_error', error);
    if (errorDescription) {
      redirectUrl.searchParams.set('error_message', errorDescription);
    }
    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  if (!code) {
    console.warn('[auth/callback] No code parameter in callback URL');
    return NextResponse.redirect(new URL('/', url.origin));
  }

  // Prepare redirect target early
  const returnCookie = requestCookies.get('openkpis_return_url')?.value;
  const redirectTo = returnCookie ? decodeURIComponent(returnCookie) : '/';
  const redirectUrl = new URL(redirectTo, url.origin);
  redirectUrl.searchParams.set('_auth_success', '1');
  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabasePublishableKey) {
    console.error('[auth/callback] Missing Supabase env vars');
    return response;
  }

  // Use a server client that writes auth cookies directly onto this response
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name: string) {
        return requestCookies.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<typeof response.cookies.set>[2]) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options?: Parameters<typeof response.cookies.set>[2]) {
        response.cookies.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  // Exchange the auth code for a session and set cookies on the response
  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession error:', {
      error: exchangeError,
      message: exchangeError.message,
      status: exchangeError.status,
      code: code.substring(0, 20) + '...', // Log partial code for debugging
    });
    
    // Redirect to home with specific error message
    const redirectUrl = new URL('/', url.origin);
    redirectUrl.searchParams.set('auth_error', 'exchange_failed');
    redirectUrl.searchParams.set('error_message', exchangeError.message || 'Failed to complete sign-in. Please try again.');
    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  // Clear the temporary return URL cookie (on the response so it propagates)
  try {
    response.cookies.set('openkpis_return_url', '', { path: '/', maxAge: 0, sameSite: 'lax' });
  } catch {}

  // Try to extract and store the provider token for Giscus
  let providerToken: string | null = null;

  if (sessionData?.session) {
    const session = sessionData.session as unknown as Record<string, unknown>;
    
    // Log session structure for debugging
    console.log('[Auth Callback] Session keys:', Object.keys(session));
    console.log('[Auth Callback] Session has provider_token:', 'provider_token' in session);
    console.log('[Auth Callback] Session has provider_access_token:', 'provider_access_token' in session);
    
    providerToken =
      (session.provider_token as string | undefined) ||
      (session.provider_access_token as string | undefined) ||
      null;

    if (!providerToken && sessionData) {
      const dataAny = sessionData as unknown as Record<string, unknown>;
      console.log('[Auth Callback] sessionData keys:', Object.keys(dataAny));
      providerToken =
        (dataAny.provider_token as string | undefined) ||
        (dataAny.provider_access_token as string | undefined) ||
        null;
    }
  }

  // Log token extraction result
  if (providerToken) {
    console.log('[Auth Callback] Provider token extracted successfully from session');
  } else {
    console.warn('[Auth Callback] Provider token NOT found in session. Trying Admin API...');
    
    // Try to fetch token using Admin API (if available)
    if (sessionData?.session?.user) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/server');
        const adminClient = createAdminClient();
        
        // Get user's identities (contains provider token)
        const { data: userData, error: adminError } = await adminClient.auth.admin.getUserById(
          sessionData.session.user.id
        );
        
        if (!adminError && userData?.user?.identities) {
          // Find GitHub identity
          const githubIdentity = userData.user.identities.find(
            (id: { provider: string }) => id.provider === 'github'
          );
          
          // Extract token from identity_data (Supabase stores it here)
          if (githubIdentity?.identity_data) {
            const identityData = githubIdentity.identity_data as Record<string, unknown>;
            providerToken = 
              (identityData.access_token as string | undefined) ||
              (identityData.provider_token as string | undefined) ||
              null;
            
            if (providerToken) {
              console.log('[Auth Callback] Provider token extracted from Admin API');
            } else {
              console.warn('[Auth Callback] Token not found in identity_data. Keys:', Object.keys(identityData));
            }
          }
        } else {
          console.warn('[Auth Callback] Admin API error:', adminError?.message);
        }
      } catch (error) {
        console.error('[Auth Callback] Failed to fetch token via Admin API:', error);
        // Non-critical - continue without token
      }
    }
  }

  if (providerToken && sessionData?.session?.user) {
    // Store in cookie (immediate use, device-specific)
    response.cookies.set('openkpis_github_token', providerToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    // ALSO store in Supabase user_metadata (cross-device support)
    // Use Admin API since session cookies aren't available yet in the same request
    try {
      const { createAdminClient } = await import('@/lib/supabase/server');
      const adminClient = createAdminClient();
      
      // Update user metadata using Admin API (bypasses session requirement)
      const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
        sessionData.session.user.id,
        {
          user_metadata: {
            ...sessionData.session.user.user_metadata,
            github_oauth_token: providerToken,
            github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
          },
        }
      );
      
      if (updateError) {
        console.error('[Auth Callback] Failed to store token in Supabase via Admin API:', updateError);
      } else {
        console.log('[Auth Callback] Stored GitHub token in Supabase user_metadata via Admin API');
      }
    } catch (error) {
      console.error('[Auth Callback] Exception storing token in Supabase:', error);
      // Non-critical - continue even if storage fails
    }
  } else {
    console.warn('[Auth Callback] No provider token available to store. User will need to re-authenticate for GitHub contributions.');
  }

  return response;
}



