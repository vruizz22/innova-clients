import React, { useState } from 'react';
import LoginScreen from './login';
import RegisterScreen from './register';
import type { UserRole } from '../../lib/types';

type AuthSubScreen = 'login' | 'register';

export interface AuthLayoutProps {
  onAuthenticated: (role: UserRole) => void;
}

export default function AuthLayout({ onAuthenticated }: AuthLayoutProps): JSX.Element {
  const [subScreen, setSubScreen] = useState<AuthSubScreen>('login');

  return subScreen === 'login' ? (
    <LoginScreen
      onLogin={(role) => onAuthenticated(role)}
      onRegister={() => setSubScreen('register')}
    />
  ) : (
    <RegisterScreen
      onRegister={(role) => onAuthenticated(role)}
      onBack={() => setSubScreen('login')}
    />
  );
}
