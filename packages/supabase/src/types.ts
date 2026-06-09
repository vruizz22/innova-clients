import type { User } from '@supabase/supabase-js';

/** Roles set as a custom claim on signup (Supabase Postgres trigger → app_metadata.role). */
export const APP_ROLES = ['student', 'teacher', 'parent', 'admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value);
}

/**
 * Reads the role claim. Prefer `app_metadata.role` (set server-side, trusted);
 * fall back to `user_metadata.role` for the pre-trigger window.
 */
export function getUserRole(user: Pick<User, 'app_metadata' | 'user_metadata'> | null): AppRole | null {
  if (!user) return null;
  const fromApp = user.app_metadata?.['role'];
  if (isAppRole(fromApp)) return fromApp;
  const fromUser = user.user_metadata?.['role'];
  if (isAppRole(fromUser)) return fromUser;
  return null;
}

/** Landing route per role after login (ADR-103 §5.2). */
export const ROLE_HOME: Record<AppRole, string> = {
  student: '/practice',
  teacher: '/dashboard',
  parent: '/family',
  admin: '/admin/error-catalog',
};

export function roleHome(role: AppRole | null): string {
  return role ? ROLE_HOME[role] : '/login';
}
