import { Card } from '@innova/ui';
import { getGradeBand, gradeLabel, type Grade } from '@innova/error-catalog';
import type { Classroom } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { DashboardClient, type CourseView } from '@/components/teacher/DashboardClient';

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
    bandCode: grade ? (getGradeBand(grade)?.code ?? null) : null,
  };
}

export default async function TeacherDashboardPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const me = await api.getMe();

  if (!me.ok) {
    return (
      <Card>
        <p className="text-sm font-bold text-slate-800">No pudimos cargar tu panel</p>
        <p className="mt-1 text-sm text-slate-500">
          {me.error.kind === 'http' && me.error.status === 401
            ? 'Tu sesión no está activa. Vuelve a entrar.'
            : 'Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento.'}
        </p>
      </Card>
    );
  }

  const classrooms = await api.getMyClassrooms();
  if (!classrooms.ok) {
    return (
      <Card>
        <p className="text-sm font-bold text-slate-800">No pudimos cargar tus cursos</p>
        <p className="mt-1 text-sm text-slate-500">Intenta de nuevo en un momento.</p>
      </Card>
    );
  }

  const courses = classrooms.data.map(toCourseView);

  return (
    <div data-testid="dashboard-root">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis cursos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Navega por banda de grado y abre el heatmap de dominio por alumno.
        </p>
      </div>
      {courses.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">
          Aún no tienes cursos asignados. Pide a tu administrador que te agregue a uno.
        </p>
      ) : (
        <DashboardClient courses={courses} />
      )}
    </div>
  );
}
