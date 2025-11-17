import { NextResponse } from 'next/server';

export async function GET() {
  // Return 204 No Content to avoid 404 noise in console.
  // You can replace this with a real icon file later.
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}



