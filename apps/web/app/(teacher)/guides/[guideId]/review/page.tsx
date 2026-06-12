import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { ReviewWizard } from '@/components/guides/ReviewWizard';

// Server Component: loads the full wizard payload (questions + current solutions)
// and the topic catalog for the topic selector.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

export default async function ReviewPage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const api = getServerApi();
  const [guide, topics] = await Promise.all([api.getGuide(guideId), api.listTopics()]);

  if (!guide.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar la guía</p>
          <Link href="/guides" className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Volver a guías
          </Link>
        </Card>
      </div>
    );
  }

  if (guide.data.status !== 'REVIEW') {
    return (
      <div className="mx-auto max-w-[640px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">Esta guía no está lista para revisar</p>
          <p className="mt-1 text-sm text-slate-500">
            Estado actual: {guide.data.status}. Vuelve cuando el procesamiento llegue a «Por revisar».
          </p>
          <Link href={`/guides/${guideId}`} className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Ver estado
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <ReviewWizard
      guideId={guideId}
      title={guide.data.title}
      questions={guide.data.questions}
      topics={topics.ok ? topics.data : []}
      initialDueAt={guide.data.dueAt ?? null}
      initialMaxResubmissions={guide.data.maxResubmissions}
      initialShowSolution={guide.data.showSolutionAfterGrade}
    />
  );
}
