import { getErrorMessage } from '@/lib/errorMessages';

interface ErrorFeedbackProps {
  errorType: string | null;
  isCorrect: boolean;
  confidence?: number;
}

export function ErrorFeedback({
  errorType,
  isCorrect,
  confidence,
}: ErrorFeedbackProps): JSX.Element {
  if (isCorrect) {
    return (
      <div className="feedback-correct">
        <span className="feedback-correct-icon" aria-hidden="true">🎉</span>
        <div>
          <p className="feedback-correct-title">¡Respuesta correcta!</p>
          <p className="feedback-correct-sub">Excelente trabajo. Sigue practicando para dominar esta habilidad.</p>
        </div>
      </div>
    );
  }

  const msg = getErrorMessage(errorType ?? 'UNKNOWN');

  return (
    <div className="feedback-error-wrap">
      <div className="feedback-error-header">
        <span className="feedback-error-icon" aria-hidden="true">🔍</span>
        <div style={{ flex: 1 }}>
          <p className="feedback-error-title">{msg.title}</p>
          {confidence != null ? (
            <p className="feedback-error-conf">
              Confianza del clasificador: {Math.round(confidence * 100)}%
            </p>
          ) : null}
        </div>
      </div>
      <div className="feedback-error-body">
        <p className="feedback-error-explanation">{msg.explanation}</p>
        {msg.hint ? (
          <div className="feedback-error-hint">
            <span className="feedback-error-hint-label">💡 Consejo:</span>
            <p>{msg.hint}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
