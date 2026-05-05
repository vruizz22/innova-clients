import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession } from '@lib/api-client';

export const SESSION_KEY = 'innova.auth.session';

export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (!session.accessToken || !session.refreshToken || !session.user?.role) {
      await clearStoredSession();
      return null;
    }
    return session;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function getStoredAccessToken(): Promise<string | null> {
  return (await getStoredSession())?.accessToken ?? null;
}

export async function storeSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
