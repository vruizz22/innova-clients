import { redirect } from 'next/navigation';

/**
 * The web app is auth + dashboards only — it has no marketing landing (that is the
 * Astro `landing` package). The root path sends visitors to the auth flow; the
 * middleware then bounces an already-authenticated user from `/login` to their
 * role home (roleHome). Unauthenticated users see the login screen.
 */
export default function RootPage(): never {
  redirect('/login');
}
