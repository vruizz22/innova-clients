import 'server-only';

import { createClient } from '@innova/supabase/server';
import { getUserRole, type AppRole } from '@innova/supabase';

/**
 * Resolves the current user's role server-side (Server Components / layouts).
 * Returns null when there is no session. Used by the shared `/guides` area to
 * branch content + the shell by role (the route is intentionally unguarded in
 * middleware so both students and teachers share the URL).
 */
export async function getCurrentRole(): Promise<AppRole | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return getUserRole(user);
}
