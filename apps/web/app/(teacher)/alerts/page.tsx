import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { AlertsPageClient } from '@/components/teacher/AlertsPageClient';

export const dynamic = 'force-dynamic';

export default async function AlertsPage(): Promise<JSX.Element> {
  const api = getServerApi();
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

  const courses = classrooms.data.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto max-w-[640px]" data-testid="alerts-root">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Alertas</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Alumnos en riesgo, errores comunes y caídas de actividad detectadas por IA.
      </p>
      <AlertsPageClient courses={courses} />
    </div>
  );
}
