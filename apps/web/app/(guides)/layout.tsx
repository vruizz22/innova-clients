import { AppShell } from '@/components/AppShell';
import { getCurrentRole } from '@/lib/role.server';

// `/guides` is a SHARED area: students and teachers use the same URL with
// different content (see middleware — /guides is intentionally unguarded). The
// shell adapts its nav + background to the viewer's role.
export default async function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const role = await getCurrentRole();
  const area =
    role === 'teacher'
      ? 'teacher'
      : role === 'parent'
      ? 'parent'
      : role === 'admin'
      ? 'admin'
      : 'student';
  return <AppShell area={area}>{children}</AppShell>;
}
