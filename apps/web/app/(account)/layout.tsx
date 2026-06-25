import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentRole } from '@/lib/role.server';

/**
 * Shared profile area, reachable from any role's header. Renders inside that
 * role's AppShell so the chrome (nav, theme tint) stays consistent.
 */
export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const role = await getCurrentRole();
  if (!role) redirect('/login');
  return <AppShell area={role}>{children}</AppShell>;
}
