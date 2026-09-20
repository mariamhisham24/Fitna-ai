import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE_NAME } from '@/lib/auth/demo';

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/dashboard/teacher', request.url);
  const response = NextResponse.redirect(redirectUrl);

  // Set the 1-click demo cookie for 1 full year
  response.cookies.set(DEMO_COOKIE_NAME, 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Also set the theme cookie if not already set
  if (!request.cookies.has('theme')) {
    response.cookies.set('theme', 'dark', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}
