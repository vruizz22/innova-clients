import React, { useState } from 'react';
import LoginScreen from './login';
import RegisterScreen from './register';
import type { AuthSession } from '../../lib/api-client';

type AuthSubScreen = 'login' | 'register';

export interface AuthLayoutProps {
  onAuthenticated: (session: AuthSession) => void;
}

export default function AuthLayout({ onAuthenticated }: AuthLayoutProps): JSX.Element {
  const [subScreen, setSubScreen] = useState<AuthSubScreen>('login');

  return subScreen === 'login' ? (
    <LoginScreen
      onLogin={onAuthenticated}
      onRegister={() => setSubScreen('register')}
    />
  ) : (
    <RegisterScreen
      onRegister={onAuthenticated}
      onBack={() => setSubScreen('login')}
    />
  );
}
