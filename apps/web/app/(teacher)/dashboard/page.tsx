import { EmptyState } from '@innova/ui';
import { getGradeBand, gradeLabel, type Grade } from '@innova/error-catalog';
import type { Classroom } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { DashboardClient, type CourseView } from '@/components/teacher/DashboardClient';
import { CreateCourseButton } from '@/components/teacher/CreateCourseButton';

// Server Component: fetches the teacher's real courses from GET /classrooms/mine.
// Per-course mastery is fetched on demand (client side) when a course is opened.
export const dynamic = 'force-dynamic';

function toGrade(gradeLevel: number): Grade | null {
  if (!Number.isInteger(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) return null;
  return `G${gradeLevel}` as Grade;
}

function toCourseView(c: Classroom): CourseView {
  const grade = toGrade(c.gradeLevel);
  return {
    id: c.id,
    name: c.name,
    grade,
    gradeLabel: grade ? gradeLabel(grade) : `Nivel ${c.gradeLevel}`,
    bandCode: grade ? getGradeBand(grade)?.code ?? null : null,
  };
}

export default async function TeacherDashboardPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const me = await api.getMe();

  if (!me.ok) {
    return (
      <EmptyState
        kind="error"
        title="No pudimos cargar tu panel"
        body={
          me.error.kind === 'http' && me.error.status === 401
            ? 'Tu sesión no está activa. Vuelve a entrar.'
            : 'Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento.'
        }
      />
    );
  }

  const classrooms = await api.getMyClassrooms();
  if (!classrooms.ok) {
    return (
      <EmptyState
        kind="error"
        title="No pudimos cargar tus cursos"
        body="Intenta de nuevo en un momento."
      />
    );
  }

  const courses = classrooms.data.map(toCourseView);

  return (
    <div data-testid="dashboard-root">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Mis cursos</h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Navega por banda de grado y abre el heatmap de dominio por alumno.
          </p>
        </div>
        <CreateCourseButton />
      </div>
      {courses.length === 0 ? (
        <EmptyState
          kind="no-courses"
          title="Aún no tienes cursos"
          body="Crea el primero con «Nuevo curso» e invita a tus alumnos con un código."
          className="mt-8"
        />
      ) : (
        <DashboardClient courses={courses} />
      )}
    </div>
  );
}
