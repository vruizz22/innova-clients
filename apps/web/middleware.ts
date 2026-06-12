import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@innova/supabase/middleware';
import { getUserRole, roleHome, type AppRole } from '@innova/supabase';

const PUBLIC_PREFIXES = ['/login', '/register', '/forgot', '/reset', '/auth'];

const ROLE_BY_PREFIX: ReadonlyArray<{ prefix: string; role: AppRole }> = [
  { prefix: '/practice', role: 'student' },
  { prefix: '/scan', role: 'student' },
  { prefix: '/dashboard', role: 'teacher' },
  { prefix: '/courses', role: 'teacher' },
  { prefix: '/exercise-bank', role: 'teacher' },
  { prefix: '/attempts', role: 'teacher' },
  { prefix: '/family', role: 'parent' },
  { prefix: '/admin', role: 'admin' },
];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const role = getUserRole(user);

  // Logged-in users shouldn't sit on auth screens.
  if (user && PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  const required = ROLE_BY_PREFIX.find((r) => pathname.startsWith(r.prefix));
  if (required) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    // admin can see everything; otherwise the route group must match the role.
    if (role && role !== 'admin' && role !== required.role) {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
