import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function RegisterPage(): JSX.Element {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
