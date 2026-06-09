import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function ForgotPage(): JSX.Element {
  return (
    <Suspense>
      <AuthForm mode="forgot" />
    </Suspense>
  );
}
