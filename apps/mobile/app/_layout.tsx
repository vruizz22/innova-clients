import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import AuthLayout from './auth/_layout';
import StudentLayout from './student/_layout';
import ParentLayout from './parent/_layout';
import type { UserRole } from '@lib/types';
import type { AuthSession } from '@lib/api-client';
import { clearStoredSession, getStoredSession, storeSession } from '@lib/auth-storage';

type AppZone = 'auth' | 'student' | 'parent';

export default function RootLayout(): JSX.Element {
  const [zone, setZone] = useState<AppZone>('auth');
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrateSession(): Promise<void> {
      const stored = await getStoredSession();
      if (!stored || cancelled) return;
      const role = stored.user.role as UserRole;
      setSession(stored);
      setZone(role === 'student' ? 'student' : 'parent');
    }
    void hydrateSession();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAuthenticated(nextSession: AuthSession): void {
    const role = nextSession.user.role as UserRole;
    setSession(nextSession);
    setZone(role === 'student' ? 'student' : 'parent');
    void storeSession(nextSession);
  }

  function handleLogout(): void {
    setSession(null);
    setZone('auth');
    void clearStoredSession();
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      {zone === 'auth' && (
        <AuthLayout onAuthenticated={handleAuthenticated} />
      )}
      {zone === 'student' && (
        <StudentLayout session={session} onLogout={handleLogout} />
      )}
      {zone === 'parent' && (
        <ParentLayout session={session} onLogout={handleLogout} />
      )}
    </>
  );
}
