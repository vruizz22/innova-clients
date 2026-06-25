import type { CookieOptions } from '@supabase/ssr';

/**
 * Scopes Supabase auth cookies to a shared parent domain when
 * `NEXT_PUBLIC_COOKIE_DOMAIN` is set (e.g. `.superprofes.app`), so sibling
 * origins — the Astro landing (superprofes.app) and the web app
 * (app.superprofes.app) — can read the same session.
 *
 * Left unset in local dev, cookies stay host-only on `localhost`, which is the
 * correct behaviour for separate dev ports. Returns the options untouched when
 * no domain is configured, preserving the prior behaviour exactly.
 */
export function withSharedDomain(options?: CookieOptions): CookieOptions | undefined {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  if (!domain) return options;
  return { ...(options ?? {}), domain };
}
