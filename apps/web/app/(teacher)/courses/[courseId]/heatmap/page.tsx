import Link from 'next/link';
import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { CourseHeatmapView } from '@/components/heatmap/CourseHeatmapView';
import { AlertsInbox } from '@/components/teacher/AlertsInbox';
import { InviteStudentsButton } from '@/components/teacher/InviteStudentsButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly courseId: string };
}

export default async function CourseHeatmapPage({ params }: PageProps): Promise<JSX.Element> {
  const courseId = decodeURIComponent(params.courseId);
  const api = getServerApi();
  const [heatmap, alerts, classrooms] = await Promise.all([
    api.getCourseHeatmap(courseId),
    api.getAlerts(courseId),
    api.getMyClassrooms(),
  ]);

  if (!heatmap.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState
          kind="error"
          title="No pudimos cargar el dominio del curso"
          action={
            <Link
              href="/dashboard"
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
            >
              ← Volver a mis cursos
            </Link>
          }
        />
      </div>
    );
  }

  const courseName = classrooms.ok
    ? (classrooms.data.find((c) => c.id === courseId)?.name ?? null)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-[1200px] justify-end">
        <InviteStudentsButton courseId={courseId} />
      </div>
      {alerts.ok ? (
        <div className="mx-auto w-full max-w-[1200px]">
          <AlertsInbox initial={alerts.data} />
        </div>
      ) : null}
      <CourseHeatmapView courseId={courseId} heatmap={heatmap.data} courseName={courseName} />
    </div>
  );
}
