import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { getCurrentRole } from '@/lib/role.server';
import { ReviewWizard } from '@/components/guides/ReviewWizard';

// Teacher-only within the shared `/guides` area (review the AI-generated pauta
// before publishing). Non-teachers are sent back to /guides.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

export default async function ReviewPage({ params }: PageProps): Promise<JSX.Element> {
  const role = await getCurrentRole();
  if (role !== 'teacher') redirect('/guides');

  const guideId = decodeURIComponent(params.guideId);
  const api = getServerApi();
  const [guide, taxonomy] = await Promise.all([api.getGuide(guideId), api.listTaxonomy()]);

  if (!guide.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState
          kind="error"
          title="No pudimos cargar la guía"
          action={
            <Link href="/guides" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
              ← Volver a guías
            </Link>
          }
        />
      </div>
    );
  }

  if (guide.data.status !== 'REVIEW') {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState
          kind="no-data"
          title="Esta guía no está lista para revisar"
          body={`Estado actual: ${guide.data.status}. Vuelve cuando el procesamiento llegue a «Por revisar».`}
          action={
            <Link href={`/guides/${guideId}`} className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
              ← Ver estado
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <ReviewWizard
      guideId={guideId}
      title={guide.data.title}
      questions={guide.data.questions}
      taxonomy={taxonomy.ok ? taxonomy.data : []}
      initialDueAt={guide.data.dueAt ?? null}
      initialMaxResubmissions={guide.data.maxResubmissions}
      initialShowSolution={guide.data.showSolutionAfterGrade}
    />
  );
}
