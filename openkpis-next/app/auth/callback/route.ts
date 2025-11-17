import { NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const cookieStore = await nextCookies();
  const supabase = await createClient();

  if (!code) {
    return NextResponse.redirect(new URL('/', url.origin));
  }

  // Exchange the auth code for a session and set cookies
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/', url.origin));
  }

  // Determine where to send the user next
  const returnCookie = cookieStore.get('openkpis_return_url')?.value;
  const redirectTo = returnCookie ? decodeURIComponent(returnCookie) : '/';

  // Clear the temporary return URL cookie
  try {
    cookieStore.set('openkpis_return_url', '', { path: '/', maxAge: 0, sameSite: 'lax' });
  } catch {}

  // 302 back to origin page
  return NextResponse.redirect(new URL(redirectTo, url.origin), { status: 302 });
}



