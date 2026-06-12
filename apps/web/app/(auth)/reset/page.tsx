import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function ResetPage(): JSX.Element {
  return (
    <Suspense>
      <AuthForm mode="reset" />
    </Suspense>
  );
}
