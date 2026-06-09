import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage(): JSX.Element {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
