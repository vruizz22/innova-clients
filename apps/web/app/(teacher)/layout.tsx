import { AppShell } from '@/components/AppShell';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <AppShell area="teacher">{children}</AppShell>;
}
