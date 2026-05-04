'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MathInput, type StepInput } from '@/components/MathInput';
import { submitAttempt } from '@/lib/api';

interface PageProps {
  params: { itemId: string };
}

// Mock item data — in production fetched from API at build/request time
const MOCK_PROBLEMS: Record<string, { problem: string; skillKey: string; skillLabel: string; expectedAnswer: number; minuend?: number; subtrahend?: number }> = {
  'item-001': { problem: '53 − 26 = ?', skillKey: 'subtraction_borrow', skillLabel: 'Resta con reagrupación', expectedAnswer: 27, minuend: 53, subtrahend: 26 },
  'item-002': { problem: '82 − 47 = ?', skillKey: 'subtraction_borrow', skillLabel: 'Resta con reagrupación', expectedAnswer: 35, minuend: 82, subtrahend: 47 },
  'item-003': { problem: '68 + 47 = ?', skillKey: 'addition_carry', skillLabel: 'Suma con llevada', expectedAnswer: 115 },
  'item-004': { problem: '7 × 8 = ?', skillKey: 'multiplication_basic', skillLabel: 'Multiplicación básica', expectedAnswer: 56 },
  'item-005': { problem: '1/3 + 1/4 = ?', skillKey: 'fractions_add', skillLabel: 'Suma de fracciones', expectedAnswer: 0 },
};

export default function PracticeItemPage({ params }: PageProps): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const item = MOCK_PROBLEMS[params.itemId] ?? MOCK_PROBLEMS['item-001'];

  async function handleSubmit(steps: StepInput[], finalAnswer: string): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const studentId = (typeof window !== 'undefined'
        ? sessionStorage.getItem('student_uuid')
        : null) ?? 'seed-student-001';

      const result = await submitAttempt({
        studentId,
        itemId: params.itemId,
        skillKey: item.skillKey,
        rawSteps: steps.map(({ value, stepIndex }) => ({
          expression: value,
          isFinal: stepIndex === steps.length - 1,
        })),
        expectedAnswer: item.expectedAnswer,
        studentAnswer: Number(finalAnswer),
        ...(item.minuend != null ? { minuend: item.minuend } : {}),
        ...(item.subtrahend != null ? { subtrahend: item.subtrahend } : {}),
      });

      // Navigate to feedback with result data
      router.push(
        `/practice/${params.itemId}/feedback?correct=${result.isCorrect ? '1' : '0'}&error=${result.errorType ?? ''}&conf=${result.confidence}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar tu respuesta.');
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <a
          href="/practice"
          className="text-sm text-[#3FA7D6] font-semibold hover:text-[#2F8DBA] flex items-center gap-1 mb-4"
        >
          ← Volver a ejercicios
        </a>
        <p className="text-xs font-semibold text-[#3FA7D6] uppercase tracking-wide mb-1">
          {item.skillLabel}
        </p>
        <h1 className="text-2xl font-bold text-[#1F2937]">Resuelve el problema</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E9F0] p-5 mb-5 shadow-sm">
        <p className="text-3xl font-bold text-center text-[#1F2937] font-mono py-4">
          {item.problem}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E9F0] p-5">
        <h2 className="text-sm font-semibold text-[#4F5868] mb-4">Escribe tu solución paso a paso</h2>
        <MathInput
          stepCount={3}
          stepLabels={['Paso 1 (unidades)', 'Paso 2 (decenas)', 'Respuesta final']}
          onSubmit={handleSubmit}
          loading={loading}
        />
        {error ? (
          <p className="mt-3 text-sm text-[#D86060]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
