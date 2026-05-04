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
      <div className="rounded-2xl bg-[#D2F2E0] border border-[#A8E5C2] p-5 flex gap-3">
        <span className="text-2xl" aria-hidden="true">🎉</span>
        <div>
          <p className="font-bold text-[#194E34] text-lg">¡Respuesta correcta!</p>
          <p className="text-sm text-[#226B47] mt-1">Excelente trabajo. Sigue practicando para dominar esta habilidad.</p>
        </div>
      </div>
    );
  }

  const msg = getErrorMessage(errorType ?? 'UNKNOWN');

  return (
    <div className="rounded-2xl bg-[#FFF4DB] border border-[#F0D9A0] p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">🔍</span>
        <div className="flex-1">
          <p className="font-bold text-[#7A4F00] text-base">{msg.title}</p>
          {confidence != null ? (
            <p className="text-xs text-[#7A4F00]/70 mt-0.5">
              Confianza del clasificador: {Math.round(confidence * 100)}%
            </p>
          ) : null}
        </div>
      </div>
      <div className="bg-white/60 rounded-xl p-3 flex flex-col gap-2">
        <p className="text-sm text-[#374050]">{msg.explanation}</p>
        {msg.hint ? (
          <div className="flex gap-2 items-start mt-1">
            <span className="text-[#3FA7D6] font-bold text-sm shrink-0">💡 Consejo:</span>
            <p className="text-sm text-[#374050]">{msg.hint}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
