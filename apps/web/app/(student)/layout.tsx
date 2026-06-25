import { AppShell } from '@/components/AppShell';

export default function StudentLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <AppShell area="student">{children}</AppShell>;
}
