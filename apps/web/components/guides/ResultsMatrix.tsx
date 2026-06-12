'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ErrorSearchTypeahead } from '@innova/ui';
import { formatHumanName, type ErrorTag } from '@innova/error-catalog';
import type {
  GuideResultsMatrix,
  MatrixCell,
  SubmissionDetail,
} from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { Latex } from '@/components/latex/Latex';

export interface ResultsMatrixProps {
  readonly guideId: string;
  readonly title: string;
  readonly matrix: GuideResultsMatrix;
}

type Tab = 'matrix' | 'errors';

interface CellStyle {
  readonly bg: string;
  readonly label: string;
}

function cellStyle(cell: MatrixCell | undefined): CellStyle {
  if (!cell) return { bg: 'bg-slate-100 text-slate-400', label: '·' };
  if (cell.status === 'GRADED') {
    return cell.isCorrect
      ? { bg: 'bg-emerald-500 text-white', label: '✓' }
      : { bg: 'bg-rose-500 text-white', label: '✗' };
  }
  if (cell.status === 'FAILED') return { bg: 'bg-amber-400 text-amber-950', label: '!' };
  // UPLOADED / TRANSCRIBING / GRADING
  return { bg: 'bg-sky-200 text-sky-700', label: '⏳' };
}

function colKey(studentId: string, questionId: string): string {
  return `${studentId}:${questionId}`;
}

export function ResultsMatrix({ guideId, title, matrix }: ResultsMatrixProps): JSX.Element {
  const [tab, setTab] = useState<Tab>('matrix');
  // Local override of cells so a manual re-tag reflects immediately.
  const [cellPatch, setCellPatch] = useState<Record<string, Partial<MatrixCell>>>({});
  const [selected, setSelected] = useState<MatrixCell | null>(null);

  const cellMap = useMemo(() => {
    const m = new Map<string, MatrixCell>();
    for (const c of matrix.cells) {
      const base = m.get(colKey(c.studentId, c.questionId));
      // cells already carry the latest attempt; keep first occurrence.
      if (!base) m.set(colKey(c.studentId, c.questionId), c);
    }
    return m;
  }, [matrix.cells]);

  const effectiveCell = useCallback(
    (studentId: string, questionId: string): MatrixCell | undefined => {
      const base = cellMap.get(colKey(studentId, questionId));
      if (!base) return undefined;
      const patch = cellPatch[base.submissionId];
      return patch ? ({ ...base, ...patch } as MatrixCell) : base;
    },
    [cellMap, cellPatch]
  );

  const onOverridden = useCallback(
    (submissionId: string, errorTagCode: string | null, errorTagName: string | null) => {
      setCellPatch((m) => ({
        ...m,
        [submissionId]: { errorTagCode, errorTagName, isOverridden: errorTagCode !== null },
      }));
      setSelected((s) =>
        s && s.submissionId === submissionId
          ? { ...s, errorTagCode, errorTagName, isOverridden: errorTagCode !== null }
          : s
      );
    },
    []
  );

  const questionLabel = (q: GuideResultsMatrix['questions'][number]): string =>
    q.label ?? `${q.sequence + 1}`;

  return (
    <div className="mx-auto max-w-[1200px]" data-testid="results-matrix-root">
      <div className="flex items-center justify-between gap-3">
        <Link href="/guides" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          ← Mis guías
        </Link>
        <Link href={`/guides/${guideId}`} className="text-sm font-medium text-slate-500">
          Ver guía
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {matrix.students.length} alumnos · {matrix.questions.length} preguntas
      </p>

      <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab('matrix')}
          className={[
            'flex-1 rounded-lg px-3 py-1.5',
            tab === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
          ].join(' ')}
        >
          Matriz
        </button>
        <button
          type="button"
          onClick={() => setTab('errors')}
          className={[
            'flex-1 rounded-lg px-3 py-1.5',
            tab === 'errors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
          ].join(' ')}
        >
          Errores comunes
        </button>
      </div>

      {tab === 'matrix' ? (
        <div className="mt-4 overflow-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-500">
                  Alumno
                </th>
                {matrix.questions.map((q) => (
                  <th
                    key={q.id}
                    className="px-2 py-2 text-center text-xs font-bold text-slate-500"
                    title={`Pregunta ${questionLabel(q)}`}
                  >
                    {questionLabel(q)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.students.map((st) => (
                <tr key={st.id} className="border-t border-slate-100">
                  <td className="sticky left-0 z-10 max-w-[180px] truncate bg-white px-3 py-2 font-medium text-slate-800">
                    {st.displayName}
                  </td>
                  {matrix.questions.map((q) => {
                    const cell = effectiveCell(st.id, q.id);
                    const sty = cellStyle(cell);
                    return (
                      <td key={q.id} className="px-1 py-1 text-center">
                        <button
                          type="button"
                          disabled={!cell}
                          onClick={() => cell && setSelected(cell)}
                          aria-label={`${st.displayName} · pregunta ${questionLabel(q)}`}
                          className={[
                            'relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                            sty.bg,
                            cell ? 'cursor-pointer hover:ring-2 hover:ring-sky-300' : 'cursor-default',
                          ].join(' ')}
                        >
                          {sty.label}
                          {cell?.isLate ? (
                            <span className="absolute -right-1 -top-1 text-[10px]">🕐</span>
                          ) : null}
                          {cell?.isOverridden ? (
                            <span className="absolute -bottom-1 -left-1 text-[10px]">✎</span>
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CommonErrorsPanel matrix={matrix} questionLabel={questionLabel} />
      )}

      <p className="mt-3 text-xs text-slate-400">
        ✓ correcto · ✗ incorrecto · ! ilegible/sin alinear · ⏳ corrigiendo · · sin entrega · 🕐 atrasada
        · ✎ corregido a mano
      </p>

      {selected ? (
        <CellDrawer
          guideId={guideId}
          cell={selected}
          studentName={
            matrix.students.find((s) => s.id === selected.studentId)?.displayName ?? 'Alumno'
          }
          onClose={() => setSelected(null)}
          onOverridden={onOverridden}
        />
      ) : null}
    </div>
  );
}

function CommonErrorsPanel({
  matrix,
  questionLabel,
}: {
  matrix: GuideResultsMatrix;
  questionLabel: (q: GuideResultsMatrix['questions'][number]) => string;
}): JSX.Element {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {matrix.questions.map((q) => {
        const ce = matrix.commonErrors.find((c) => c.questionId === q.id);
        const tags = ce?.tags ?? [];
        return (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-800">Pregunta {questionLabel(q)}</p>
            {tags.length === 0 ? (
              <p className="mt-1 text-xs text-slate-400">Sin errores registrados.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.code}
                    className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700"
                  >
                    {formatHumanName(t.code)}
                    <span className="rounded-full bg-rose-200 px-1.5 text-[10px] text-rose-800">
                      {t.count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CellDrawer({
  guideId,
  cell,
  studentName,
  onClose,
  onOverridden,
}: {
  guideId: string;
  cell: MatrixCell;
  studentName: string;
  onClose: () => void;
  onOverridden: (submissionId: string, code: string | null, name: string | null) => void;
}): JSX.Element {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingTag, setPendingTag] = useState<ErrorTag | null>(null);
  const [saving, setSaving] = useState(false);

  // Load detail when the drawer opens for a cell (interactive on-demand fetch).
  useEffect(() => {
    let active = true;
    setLoading(true);
    setDetail(null);
    void getBrowserApi()
      .getSubmissionDetail(guideId, cell.submissionId)
      .then((res) => {
        if (!active) return;
        if (res.ok) setDetail(res.data);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [guideId, cell.submissionId]);

  const saveOverride = useCallback(async () => {
    if (!pendingTag) return;
    setSaving(true);
    const res = await getBrowserApi().overrideSubmissionError(guideId, cell.submissionId, {
      errorTagCode: pendingTag.code,
    });
    setSaving(false);
    if (res.ok) {
      onOverridden(cell.submissionId, res.data.errorTagCode, res.data.errorTagName);
      setPendingTag(null);
    }
  }, [pendingTag, guideId, cell.submissionId, onOverridden]);

  const clearOverride = useCallback(async () => {
    setSaving(true);
    const res = await getBrowserApi().overrideSubmissionError(guideId, cell.submissionId, {
      errorTagCode: null,
    });
    setSaving(false);
    if (res.ok) onOverridden(cell.submissionId, null, null);
  }, [guideId, cell.submissionId, onOverridden]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30"
      />
      <div className="relative z-50 flex h-full w-full max-w-[440px] flex-col gap-4 overflow-auto bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Entrega · {studentName}
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">Intento {cell.attemptNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : !detail ? (
          <p className="text-sm text-rose-600">No pudimos cargar el detalle.</p>
        ) : (
          <>
            <div className="rounded-xl bg-slate-900 px-4 py-3 text-center">
              <Latex display className="text-white">
                {detail.statementLatex}
              </Latex>
            </div>

            {detail.photoUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {detail.photoUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Sin fotos disponibles.</p>
            )}

            {detail.transcriptionLatex ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Transcripción
                </p>
                <Latex display>{detail.transcriptionLatex}</Latex>
                {detail.transcriptionConfidence !== null ? (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Confianza {Math.round(detail.transcriptionConfidence * 100)}%
                  </p>
                ) : null}
              </div>
            ) : null}

            {detail.alignmentJson && detail.alignmentJson.length > 0 ? (
              <div className="rounded-xl border border-slate-200 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Alineación con la pauta
                </p>
                <ol className="mt-1 flex flex-col gap-1">
                  {detail.alignmentJson.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className={
                          a.verdict === 'ok' || a.verdict === 'correct'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }
                      >
                        {a.verdict === 'ok' || a.verdict === 'correct' ? '✓' : '✗'}
                      </span>
                      {a.studentLatex ? <Latex>{a.studentLatex}</Latex> : <span>Paso {i + 1}</span>}
                      {a.note ? <span className="text-slate-400">— {a.note}</span> : null}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {detail.failureReason ? (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {detail.failureReason}
              </p>
            ) : null}

            <div className="rounded-xl border border-slate-200 px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Error asignado
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {cell.errorTagCode ? formatHumanName(cell.errorTagCode) : 'Ninguno'}
                {cell.isOverridden ? (
                  <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                    corregido a mano
                  </span>
                ) : null}
              </p>

              <p className="mt-3 text-xs text-slate-500">Corregir el error a mano:</p>
              <div className="mt-1">
                <ErrorSearchTypeahead
                  status="ACTIVE"
                  onSelect={(tag) => setPendingTag(tag)}
                  placeholder="Buscar el error correcto…"
                />
              </div>
              {pendingTag ? (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {formatHumanName(pendingTag.code)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void saveOverride()}
                    disabled={saving}
                    className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600 disabled:opacity-40"
                  >
                    {saving ? 'Guardando…' : 'Asignar'}
                  </button>
                </div>
              ) : null}
              {cell.isOverridden ? (
                <button
                  type="button"
                  onClick={() => void clearOverride()}
                  disabled={saving}
                  className="mt-2 text-xs font-medium text-slate-500 underline-offset-2 hover:underline disabled:opacity-40"
                >
                  Quitar corrección manual
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
