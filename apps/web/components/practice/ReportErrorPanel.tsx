'use client';

import { useCallback, useState } from 'react';
import { ErrorSearchTypeahead } from '@innova/ui';
import { formatHumanName, type ErrorTag } from '@innova/error-catalog';
import { getBrowserApi } from '@/lib/api.client';

export interface ReportErrorPanelProps {
  readonly attemptId: string;
  /** The code the classifier suggested — excluded/contrasted in the report UI. */
  readonly suggestedCode: string;
}

type State =
  | { readonly kind: 'closed' }
  | { readonly kind: 'picking'; readonly tag: ErrorTag | null }
  | { readonly kind: 'sending'; readonly tag: ErrorTag }
  | { readonly kind: 'sent' }
  | { readonly kind: 'error'; readonly tag: ErrorTag; readonly message: string };

/**
 * Attempt review "reportar otro error" (v8 C4). A student or teacher who disagrees
 * with the classifier picks the correct tag from the catalog; the backend records
 * it with ErrorSource.FIELD_REPORTED via POST /attempts/:id/report.
 */
export function ReportErrorPanel({ attemptId, suggestedCode }: ReportErrorPanelProps): JSX.Element {
  const [state, setState] = useState<State>({ kind: 'closed' });
  const [comment, setComment] = useState('');

  const submit = useCallback(
    async (tag: ErrorTag): Promise<void> => {
      setState({ kind: 'sending', tag });
      const api = getBrowserApi();
      const trimmed = comment.trim();
      const res = await api.reportAttemptError(attemptId, {
        errorTagCode: tag.code,
        ...(trimmed ? { comment: trimmed } : {}),
      });
      if (res.ok) {
        setState({ kind: 'sent' });
      } else {
        setState({
          kind: 'error',
          tag,
          message: 'No pudimos enviar tu reporte. Intenta de nuevo en un momento.',
        });
      }
    },
    [attemptId, comment]
  );

  if (state.kind === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        ✅ ¡Gracias! Registramos el error correcto. Esto ayuda a mejorar la detección.
      </div>
    );
  }

  if (state.kind === 'closed') {
    return (
      <button
        type="button"
        onClick={() => setState({ kind: 'picking', tag: null })}
        className="self-start text-sm font-medium text-sky-600 underline-offset-2 hover:underline"
      >
        ¿No es ese el error? Reporta el correcto
      </button>
    );
  }

  const selectedTag = state.kind === 'picking' ? state.tag : state.tag;
  const sending = state.kind === 'sending';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-bold text-slate-800">Reportar el error correcto</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Detectamos «{formatHumanName(suggestedCode)}». Si no es así, elige el error real del
          catálogo.
        </p>
      </div>

      <ErrorSearchTypeahead
        status="ACTIVE"
        onSelect={(tag) => setState({ kind: 'picking', tag })}
        placeholder="Buscar el error correcto…"
      />

      {selectedTag ? (
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-sm font-semibold text-slate-800">{formatHumanName(selectedTag.code)}</p>
          <p className="font-mono text-[11px] text-slate-500">{selectedTag.code}</p>
        </div>
      ) : null}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario (opcional): ¿qué pasó realmente?"
        rows={2}
        disabled={sending}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />

      {state.kind === 'error' ? (
        <p className="text-sm font-medium text-rose-700">{state.message}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setState({ kind: 'closed' })}
          disabled={sending}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => selectedTag && submit(selectedTag)}
          disabled={!selectedTag || sending}
          className="flex-1 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  );
}
