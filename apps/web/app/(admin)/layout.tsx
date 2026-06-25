import { AppShell } from '@/components/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <AppShell area="admin">{children}</AppShell>;
}
