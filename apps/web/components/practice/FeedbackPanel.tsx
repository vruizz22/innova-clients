'use client';

import type { AttemptResult } from '@innova/api-client';
import { formatHumanName } from '@innova/error-catalog';
import { ReportErrorPanel } from './ReportErrorPanel';

/** Codes the classifier returns when the answer is fine — never shown as an error. */
const CORRECT_CODES = new Set(['CORRECT', 'NONE', '']);

export interface FeedbackPanelProps {
  readonly result: AttemptResult;
  /** Primary CTA (e.g. back to practice, or scan another). */
  readonly onNext: () => void;
  readonly nextLabel?: string;
  /** Secondary CTA — omit to hide (e.g. scan has no in-place retry). */
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
}

/**
 * Shared post-attempt feedback: correctness, human-readable error name, and the
 * v8 C4 "reportar otro error" panel when the classifier flagged an error.
 */
export function FeedbackPanel({
  result,
  onNext,
  nextLabel = 'Siguiente →',
  onRetry,
  retryLabel = 'Intentar de nuevo',
}: FeedbackPanelProps): JSX.Element {
  const isError = !result.isCorrect && !CORRECT_CODES.has(result.errorTagCode);

  return (
    <div className="flex flex-col gap-4">
      {result.isCorrect ? (
        <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-lg font-black text-emerald-700">¡Correcto!</p>
          <p className="mt-1 text-sm text-emerald-600">Lo resolviste muy bien. Sigue así.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-amber-50 px-5 py-6 text-center">
          <p className="text-4xl">💪</p>
          <p className="mt-2 text-lg font-black text-amber-700">Casi lo tienes</p>
          {isError ? (
            <p className="mt-1 text-sm text-amber-700">
              Parece que el error fue:{' '}
              <span className="font-semibold">{formatHumanName(result.errorTagCode)}</span>.
            </p>
          ) : (
            <p className="mt-1 text-sm text-amber-700">
              Revisa tu desarrollo paso a paso e inténtalo otra vez.
            </p>
          )}
          <p className="mt-2 text-xs text-amber-600">
            No te rindas — equivocarse es parte de aprender.
          </p>
        </div>
      )}

      {isError ? (
        <ReportErrorPanel attemptId={result.attemptId} suggestedCode={result.errorTagCode} />
      ) : null}

      <div className="flex items-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {retryLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-sky-500 px-5 py-3 text-base font-bold text-white hover:bg-sky-600"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
