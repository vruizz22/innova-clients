'use client';

import { formatHumanName } from '@innova/error-catalog';
import { CheckCircleIcon, AlertTriangleIcon, LoaderIcon } from '@innova/ui';
import { ReportErrorPanel } from './ReportErrorPanel';

/** Codes the classifier returns when the answer is fine — never shown as an error. */
const CORRECT_CODES = new Set(['CORRECT', 'NONE', '']);
/**
 * Codes that mean "not classified yet" — a pending state, never a real error.
 * The async LLM worker fills the real tag in later; until then we show a calm
 * "estamos revisando" instead of the demoralizing "el error fue: Sin clasificar".
 */
const PENDING_CODES = new Set(['UNCLASSIFIED', 'PENDING']);

/**
 * Minimal shape FeedbackPanel renders. Any attempt/status result satisfies it;
 * `errorTagName` is the es-CL catalog name (preferred over humanizing the code).
 */
export interface FeedbackResult {
  readonly attemptId: string;
  readonly isCorrect: boolean;
  readonly errorTagCode: string;
  readonly errorTagName?: string | null;
}

export interface FeedbackPanelProps {
  readonly result: FeedbackResult;
  /** Primary CTA (e.g. back to practice, or scan another). */
  readonly onNext: () => void;
  readonly nextLabel?: string;
  /** Secondary CTA — omit to hide. While pending it re-runs the analysis. */
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
}

/**
 * Shared post-attempt feedback: correctness, a pending "analizando" state while the
 * classifier is still working, the human-readable (es-CL) error name once classified,
 * and the v8 C4 "reportar otro error" panel.
 */
export function FeedbackPanel({
  result,
  onNext,
  nextLabel = 'Siguiente →',
  onRetry,
  retryLabel = 'Intentar de nuevo',
}: FeedbackPanelProps): JSX.Element {
  const { attemptId, isCorrect, errorTagCode } = result;
  const isPending = !isCorrect && PENDING_CODES.has(errorTagCode);
  const isError = !isCorrect && !isPending && !CORRECT_CODES.has(errorTagCode);
  const errorLabel = result.errorTagName ?? formatHumanName(errorTagCode);

  return (
    <div className="flex flex-col gap-4">
      {isCorrect ? (
        <div className="rounded-2xl bg-[var(--success-bg)] px-5 py-6 text-center">
          <CheckCircleIcon size={40} className="mx-auto text-mint-500" />
          <p className="mt-2 text-lg font-black text-mint-700">¡Correcto!</p>
          <p className="mt-1 text-sm text-mint-600">Lo resolviste muy bien. Sigue así.</p>
        </div>
      ) : isPending ? (
        <div className="rounded-2xl bg-[var(--info-bg)] px-5 py-6 text-center">
          <LoaderIcon size={36} className="mx-auto animate-spin text-[var(--info-fg)]" />
          <p className="mt-2 text-lg font-black text-[var(--info-fg)]">Revisando tu desarrollo…</p>
          <p className="mt-1 text-sm text-[var(--info-fg)]">
            Estamos analizando paso a paso en qué te equivocaste. Esto puede tardar un momento.
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="sp-press mt-4 inline-flex rounded-xl border border-[var(--info-fg)]/30 px-4 py-2 text-sm font-semibold text-[var(--info-fg)] transition-colors hover:bg-[var(--info-fg)]/10"
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--warning-bg)] px-5 py-6 text-center">
          <AlertTriangleIcon size={40} className="mx-auto text-[var(--warning-fg)]" />
          <p className="mt-2 text-lg font-black text-[var(--warning-fg)]">Casi lo tienes</p>
          {isError ? (
            <p className="mt-1 text-sm text-[var(--warning-fg)]">
              Parece que el error fue: <span className="font-semibold">{errorLabel}</span>.
            </p>
          ) : (
            <p className="mt-1 text-sm text-[var(--warning-fg)]">
              Revisa tu desarrollo paso a paso e inténtalo otra vez.
            </p>
          )}
          <p className="mt-2 text-xs text-[var(--warning-fg)]/80">
            No te rindas — equivocarse es parte de aprender.
          </p>
        </div>
      )}

      {isError || isPending ? (
        <ReportErrorPanel attemptId={attemptId} suggestedCode={isError ? errorTagCode : ''} />
      ) : null}

      <div className="flex items-center gap-3">
        {onRetry && !isPending ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--fg-2)] hover:bg-[var(--surface-2)]"
          >
            {retryLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
