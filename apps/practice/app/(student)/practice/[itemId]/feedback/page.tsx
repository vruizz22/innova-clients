'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorFeedback } from '@/components/ErrorFeedback';

interface PageProps {
  params: { itemId: string };
}

function FeedbackContent({ itemId }: { itemId: string }): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();

  const isCorrect = params.get('correct') === '1';
  const errorType = params.get('error') ?? null;
  const confidenceStr = params.get('conf');
  const confidence = confidenceStr ? parseFloat(confidenceStr) : undefined;

  return (
    <main className="page-wrapper">
      <div className="feedback-head">
        <h1>Resultado</h1>
        <p>
          {isCorrect ? '¡Lo lograste! Tu respuesta fue correcta.' : 'Revisa la explicación para mejorar.'}
        </p>
      </div>

      <ErrorFeedback
        isCorrect={isCorrect}
        errorType={errorType}
        confidence={confidence}
      />

      <div className="feedback-actions">
        <button
          className="btn btn-primary btn-submit-full"
          onClick={() => router.push('/practice')}
        >
          Siguiente ejercicio
        </button>
        <button
          className="btn btn-secondary btn-submit-full"
          onClick={() => router.push(`/practice/${itemId}`)}
        >
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}

export default function FeedbackPage({ params }: PageProps): JSX.Element {
  return (
    <Suspense fallback={<main className="page-wrapper"><p style={{ color: 'var(--fg-2)' }}>Cargando...</p></main>}>
      <FeedbackContent itemId={params.itemId} />
    </Suspense>
  );
}
