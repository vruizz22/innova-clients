import type { AuthSession, UserRole } from './api-client';

export const SESSION_KEY = 'innova.auth.session';

export type StoredAuthSession = AuthSession;

export function getStoredSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user?.role) {
      clearStoredSession();
      return null;
    }
    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function getAccessToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}

export function storeSession(session: StoredAuthSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getDashboardUrl(role: UserRole): string {
  if (role === 'teacher') {
    return process.env.NEXT_PUBLIC_TEACHER_URL ?? (
      process.env.NODE_ENV === 'production' ? 'https://profe.superprofes.app' : 'http://localhost:3001'
    );
  }

  if (role === 'parent') {
    return process.env.NEXT_PUBLIC_PARENT_URL ?? (
      process.env.NODE_ENV === 'production' ? 'https://superprofes.app' : 'http://localhost:8081'
    );
  }

  return process.env.NEXT_PUBLIC_PRACTICE_URL ?? (
    process.env.NODE_ENV === 'production' ? 'https://practice.superprofes.app' : 'http://localhost:3002'
  );
}
