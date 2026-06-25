import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { getCurrentRole } from '@/lib/role.server';
import { GuideUploader, type CourseOption } from '@/components/guides/GuideUploader';

// Teacher-only within the shared `/guides` area. `/guides` is unguarded in
// middleware, so we guard authoring in-page (non-teachers → back to /guides).
export const dynamic = 'force-dynamic';

export default async function NewGuidePage(): Promise<JSX.Element> {
  const role = await getCurrentRole();
  if (role !== 'teacher') redirect('/guides');

  const api = getServerApi();
  const classrooms = await api.getMyClassrooms();

  const courses: CourseOption[] = classrooms.ok
    ? classrooms.data.map((c) => ({ id: c.id, name: c.name }))
    : [];

  return (
    <div className="mx-auto max-w-[640px]">
      <Link
        href="/guides"
        className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
      >
        ← Guías
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--fg-1)]">Nueva guía</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Sube el PDF de tu guía. Generaremos la pauta para que la revises antes de publicar.
      </p>

      <div className="mt-6">
        {!classrooms.ok ? (
          <EmptyState
            kind="error"
            title="No pudimos cargar tus cursos"
            body="Intenta de nuevo en un momento."
          />
        ) : courses.length === 0 ? (
          <EmptyState
            kind="no-courses"
            title="No tienes cursos asignados"
            body="Pídele a tu administrador que te agregue a un curso para crear guías."
          />
        ) : (
          <GuideUploader courses={courses} />
        )}
      </div>
    </div>
  );
}
