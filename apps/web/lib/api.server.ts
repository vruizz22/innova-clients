import 'server-only';

import { createApiClient, type InnovaApiClient } from '@innova/api-client';
import { createClient } from '@innova/supabase/server';

/**
 * Server-side Innova API client (Server Components, Route Handlers, Server Actions).
 *
 * The Supabase access token is injected lazily via `getToken`, so the NestJS
 * backend receives `Authorization: Bearer <supabase access_token>` and validates
 * it as a Supabase JWT. Decoupled from the api-client package (Dependency
 * Inversion): the package never imports Supabase.
 */
export function getServerApi(): InnovaApiClient {
  const supabase = createClient();

  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
    getToken: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    },
  });
}
