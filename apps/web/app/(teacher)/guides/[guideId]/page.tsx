import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { GuideDetailView } from '@/components/guides/GuideDetailView';

// Server Component: initial guide detail; the client view polls while the
// pipeline is still working (UPLOADED → EXTRACTING → GENERATING_SOLUTIONS).
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

export default async function GuideDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const api = getServerApi();
  const guide = await api.getGuide(guideId);

  return (
    <div className="mx-auto max-w-[640px]">
      <Link href="/guides" className="text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Guías
      </Link>
      <div className="mt-4">
        {!guide.ok ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No pudimos cargar la guía</p>
            <p className="mt-1 text-sm text-slate-500">
              {guide.error.kind === 'http' && guide.error.status === 404
                ? 'Esta guía no existe o no es de un curso que enseñas.'
                : 'Intenta de nuevo en un momento.'}
            </p>
          </Card>
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
