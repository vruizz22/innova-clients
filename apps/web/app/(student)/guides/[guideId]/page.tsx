import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { QuizView } from '@/components/guides/QuizView';

// Server Component: the quiz payload (questions WITHOUT the solution + my
// submission states). The client view handles upload + non-blocking polling.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

export default async function StudentGuidePage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const api = getServerApi();
  const quiz = await api.getQuiz(guideId);

  if (!quiz.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar la guía</p>
          <Link href="/guides" className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Mis guías
          </Link>
        </Card>
      </div>
    );
  }

  return <QuizView guideId={guideId} quiz={quiz.data} />;
}
