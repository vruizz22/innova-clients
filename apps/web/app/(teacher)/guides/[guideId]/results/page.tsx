import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { ResultsMatrix } from '@/components/guides/ResultsMatrix';

// Server Component: the teacher's Student × Question results matrix (C11).
// The client component owns the cell drawer + manual error-tag override.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

export default async function GuideResultsPage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const api = getServerApi();
  const [matrix, guide] = await Promise.all([
    api.getGuideResultsMatrix(guideId),
    api.getGuide(guideId),
  ]);

  if (!matrix.ok) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar los resultados</p>
          <p className="mt-1 text-sm text-slate-500">
            {matrix.error.kind === 'http' && matrix.error.status === 403
              ? 'No tienes acceso a esta guía.'
              : 'Intenta de nuevo en un momento.'}
          </p>
          <Link href="/guides" className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Mis guías
          </Link>
        </Card>
      </div>
    );
  }

  const title = guide.ok ? guide.data.title : 'Resultados';

  return <ResultsMatrix guideId={guideId} title={title} matrix={matrix.data} />;
}
