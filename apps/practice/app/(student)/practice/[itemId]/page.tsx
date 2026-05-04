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
        ...(params.itemId.startsWith('item-') ? {} : { itemId: params.itemId }),
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
    <main className="page-wrapper">
      <a href="/practice" className="exercise-back-link">
        ← Volver a ejercicios
      </a>
      <p className="exercise-skill-label">{item.skillLabel}</p>
      <h1 className="exercise-title">Resuelve el problema</h1>

      <div className="problem-display">
        <p className="problem-expr math">{item.problem}</p>
      </div>

      <div className="steps-card">
        <p className="steps-card-title">Escribe tu solución paso a paso</p>
        <MathInput
          stepCount={3}
          stepLabels={['Paso 1 (unidades)', 'Paso 2 (decenas)', 'Respuesta final']}
          onSubmit={handleSubmit}
          loading={loading}
        />
        {error ? (
          <p className="inline-error" role="alert">{error}</p>
        ) : null}
      </div>
    </main>
  );
}
