import { AppShell } from '@/components/AppShell';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <AppShell area="parent">{children}</AppShell>;
}
