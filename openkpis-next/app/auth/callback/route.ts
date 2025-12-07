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
    providerToken =
      (session.provider_token as string | undefined) ||
      (session.provider_access_token as string | undefined) ||
      null;

    if (!providerToken && sessionData) {
      const dataAny = sessionData as unknown as Record<string, unknown>;
      providerToken =
        (dataAny.provider_token as string | undefined) ||
        (dataAny.provider_access_token as string | undefined) ||
        null;
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
    try {
      await supabase.auth.updateUser({
        data: {
          github_oauth_token: providerToken,
          github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        },
      });
      console.log('[Auth Callback] Stored GitHub token in Supabase user_metadata');
    } catch (error) {
      console.error('[Auth Callback] Failed to store token in Supabase:', error);
      // Non-critical - continue even if storage fails
    }
  }

  return response;
}



