import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { CourseHeatmapView } from '@/components/heatmap/CourseHeatmapView';

// Server Component: Student × Unit mastery heatmap for one course (C12).
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly courseId: string };
}

export default async function CourseHeatmapPage({ params }: PageProps): Promise<JSX.Element> {
  const courseId = decodeURIComponent(params.courseId);
  const api = getServerApi();
  const heatmap = await api.getCourseHeatmap(courseId);

  if (!heatmap.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar el dominio del curso</p>
          <Link href="/dashboard" className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Cursos
          </Link>
        </Card>
      </div>
    );
  }

  return <CourseHeatmapView courseId={courseId} heatmap={heatmap.data} />;
}
