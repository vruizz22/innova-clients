import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import AuthLayout from './auth/_layout';
import StudentLayout from './student/_layout';
import ParentLayout from './parent/_layout';
import type { UserRole } from '../lib/types';

type AppZone = 'auth' | 'student' | 'parent';

export default function RootLayout(): JSX.Element {
  // For demo: start at auth; after login navigate to appropriate zone
  const [zone, setZone] = useState<AppZone>('student');

  function handleAuthenticated(role: UserRole): void {
    setZone(role === 'student' ? 'student' : 'parent');
  }

  function handleLogout(): void {
    setZone('auth');
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      {zone === 'auth' && (
        <AuthLayout onAuthenticated={handleAuthenticated} />
      )}
      {zone === 'student' && (
        <StudentLayout onLogout={handleLogout} />
      )}
      {zone === 'parent' && (
        <ParentLayout onLogout={handleLogout} />
      )}
    </>
  );
}
