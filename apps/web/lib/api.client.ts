'use client';

import { createApiClient, type InnovaApiClient } from '@innova/api-client';
import { createClient } from '@innova/supabase/client';

/**
 * Browser-side Innova API client (Client Components / React Query mutations).
 *
 * Reuses a single Supabase browser client and reads the access token lazily on
 * every request so a refreshed session is always picked up. Never reads the
 * service-role key (server-only) and never touches localStorage for the token —
 * `@supabase/ssr` keeps it in httpOnly cookies.
 */
let cachedApi: InnovaApiClient | null = null;

export function getBrowserApi(): InnovaApiClient {
  if (cachedApi) return cachedApi;

  const supabase = createClient();
  cachedApi = createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
    getToken: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    },
  });

  return cachedApi;
}
