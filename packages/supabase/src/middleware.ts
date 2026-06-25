import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { withSharedDomain } from './cookie-domain';

export interface SessionResult {
  /** Response with refreshed auth cookies — must be returned (or its cookies copied). */
  response: NextResponse;
  user: User | null;
}

/**
 * Refreshes the Supabase session and returns the current user.
 * Wire into `apps/web/middleware.ts`; the app then does role-based routing.
 * Do NOT run logic between `createServerClient` and `getUser()` (auth invariant).
 */
export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, withSharedDomain(options));
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
