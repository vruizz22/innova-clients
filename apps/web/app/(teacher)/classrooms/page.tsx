import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { ClassroomsClient, type ClassroomRow } from '@/components/teacher/ClassroomsClient';
import { CreateCourseButton } from '@/components/teacher/CreateCourseButton';

export const dynamic = 'force-dynamic';

export default async function ClassroomsPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const classrooms = await api.getMyClassrooms();

  if (!classrooms.ok) {
    return (
      <EmptyState
        kind="error"
        title="No pudimos cargar tus cursos"
        body={
          classrooms.error.kind === 'http' && classrooms.error.status === 401
            ? 'Tu sesión no está activa. Vuelve a entrar.'
            : 'Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento.'
        }
      />
    );
  }

  const rows: ClassroomRow[] = classrooms.data.map((c) => ({
    id: c.id,
    name: c.name,
    gradeLevel: c.gradeLevel,
    letter: c.letter ?? null,
  }));

  return (
    <div data-testid="classrooms-root">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Mis cursos</h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Gestiona alumnos, genera invitaciones y accede al heatmap de cada curso.
          </p>
        </div>
        <CreateCourseButton />
      </div>
      <ClassroomsClient classrooms={rows} />
    </div>
  );
}
