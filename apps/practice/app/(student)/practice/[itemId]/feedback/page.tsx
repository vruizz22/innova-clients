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
    <main className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Resultado</h1>
        <p className="text-sm text-[#4F5868] mt-1">
          {isCorrect ? '¡Lo lograste! Tu respuesta fue correcta.' : 'Revisa la explicación para mejorar.'}
        </p>
      </div>

      <ErrorFeedback
        isCorrect={isCorrect}
        errorType={errorType}
        confidence={confidence}
      />

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => router.push('/practice')}
          className="w-full py-3 rounded-xl font-semibold text-white bg-[#3FA7D6] hover:bg-[#2F8DBA] transition-colors"
        >
          Siguiente ejercicio
        </button>
        <button
          onClick={() => router.push(`/practice/${itemId}`)}
          className="w-full py-3 rounded-xl font-semibold text-[#4F5868] bg-[#F7F8FA] hover:bg-[#E5E9F0] transition-colors border border-[#E5E9F0]"
        >
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}

export default function FeedbackPage({ params }: PageProps): JSX.Element {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-lg px-4 py-8 text-[#4F5868]">Cargando...</div>}>
      <FeedbackContent itemId={params.itemId} />
    </Suspense>
  );
}
