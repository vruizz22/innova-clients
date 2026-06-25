import Link from 'next/link';
import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { getCurrentRole } from '@/lib/role.server';
import { GuideDetailView } from '@/components/guides/GuideDetailView';
import { QuizView } from '@/components/guides/QuizView';

// Shared `/guides/[guideId]` — teacher's pipeline/detail view or the student's
// quiz (questions without the solution), branched by role (Server Component).
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

async function TeacherGuideDetail({ guideId }: { guideId: string }): Promise<JSX.Element> {
  const api = getServerApi();
  const guide = await api.getGuide(guideId);

  return (
    <div className="mx-auto max-w-[640px]">
      <Link href="/guides" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
        ← Guías
      </Link>
      <div className="mt-4">
        {!guide.ok ? (
          <EmptyState
            kind="error"
            title="No pudimos cargar la guía"
            body={
              guide.error.kind === 'http' && guide.error.status === 404
                ? 'Esta guía no existe o no es de un curso que enseñas.'
                : 'Intenta de nuevo en un momento.'
            }
          />
        ) : (
          <GuideDetailView
            guideId={guideId}
            title={guide.data.title}
            initialStatus={guide.data.status}
            initialFailureReason={guide.data.failureReason ?? null}
            questionCount={guide.data.questionCount}
          />
        )}
      </div>
    </div>
  );
}

async function StudentGuideQuiz({ guideId }: { guideId: string }): Promise<JSX.Element> {
  const api = getServerApi();
  const quiz = await api.getQuiz(guideId);

  if (!quiz.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState
          kind="error"
          title="No pudimos cargar la guía"
          action={
            <Link href="/guides" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
              ← Mis guías
            </Link>
          }
        />
      </div>
    );
  }

  return <QuizView guideId={guideId} quiz={quiz.data} />;
}

export default async function GuideDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const role = await getCurrentRole();
  return role === 'teacher' ? (
    <TeacherGuideDetail guideId={guideId} />
  ) : (
    <StudentGuideQuiz guideId={guideId} />
  );
}
