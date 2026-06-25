'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ErrorSearchTypeahead,
  ImageLightbox,
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  LoaderIcon,
  ClockIcon,
  PencilIcon,
  ArrowLeftIcon,
} from '@innova/ui';
import { formatHumanName, type ErrorTag } from '@innova/error-catalog';
import type {
  CatalogError,
  GuideResultsMatrix,
  MatrixCell,
  SubmissionDetail,
} from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { Latex } from '@/components/latex/Latex';
import { MathText } from '@/components/latex/MathText';

/** Map a live-catalog search hit to the bundled ErrorTag shape the typeahead expects. */
function toCatalogErrorTag(r: CatalogError): ErrorTag {
  const name = r.name ?? formatHumanName(r.code);
  return {
    code: r.code,
    domain_code: r.domainCode ?? '',
    subdomain_code: r.subdomainCode ?? '',
    name_es: name,
    name_en: name,
    description_es: '',
    applicable_grades: [],
    oa_codes: [],
    prerequisites: [],
    severity: 'MEDIUM',
    source: 'LLM_GENERATED',
    status: 'ACTIVE',
    created_at: '',
  };
}

/**
 * Live backend error-catalog search (the full ACTIVE catalog, 2.6k+ tags) for the
 * teacher's manual override — replaces the bundled ~40-error seed so every error the
 * classifier can assign is searchable, just like the topic taxonomy is served live.
 */
async function searchCatalogErrorsRemote(query: string): Promise<ErrorTag[]> {
  const res = await getBrowserApi().searchCatalogErrors({ q: query, limit: 12 });
  return res.ok ? res.data.map(toCatalogErrorTag) : [];
}

export interface ResultsMatrixProps {
  readonly guideId: string;
  readonly title: string;
  readonly matrix: GuideResultsMatrix;
}

type Tab = 'matrix' | 'errors';

type CellKind = 'ok' | 'no' | 'fail' | 'wip' | 'none';

interface CellStyle {
  readonly bg: string;
  readonly kind: CellKind;
}

function cellStyle(cell: MatrixCell | undefined): CellStyle {
  if (!cell) return { bg: 'bg-[var(--surface-2)] text-[var(--fg-3)]', kind: 'none' };
  if (cell.status === 'GRADED') {
    return cell.isCorrect
      ? { bg: 'bg-mint-500 text-white', kind: 'ok' }
      : { bg: 'bg-danger text-white', kind: 'no' };
  }
  if (cell.status === 'FAILED') return { bg: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]', kind: 'fail' };
  // UPLOADED / TRANSCRIBING / GRADING
  return { bg: 'bg-[var(--info-bg)] text-[var(--info-fg)]', kind: 'wip' };
}

function CellGlyph({ kind }: { kind: CellKind }): JSX.Element {
  switch (kind) {
    case 'ok':
      return <CheckIcon size={14} strokeWidth={2.5} />;
    case 'no':
      return <XIcon size={14} strokeWidth={2.5} />;
    case 'fail':
      return <AlertTriangleIcon size={13} strokeWidth={2} />;
    case 'wip':
      return <LoaderIcon size={13} className="animate-spin" />;
    case 'none':
      return <span aria-hidden>·</span>;
  }
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
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          <ArrowLeftIcon size={16} /> Mis guías
        </Link>
        <Link href={`/guides/${guideId}`} className="text-sm font-medium text-[var(--fg-2)]">
          Ver guía
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg-1)]">{title}</h1>
      <p className="math mt-1 text-sm text-[var(--fg-2)]">
        {matrix.students.length} alumnos · {matrix.questions.length} preguntas
      </p>

      <div className="mt-4 flex gap-1 rounded-xl bg-[var(--surface-2)] p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab('matrix')}
          className={[
            'flex-1 rounded-lg px-3 py-1.5',
            tab === 'matrix'
              ? 'bg-[var(--surface)] text-[var(--fg-1)] shadow-sm'
              : 'text-[var(--fg-2)]',
          ].join(' ')}
        >
          Matriz
        </button>
        <button
          type="button"
          onClick={() => setTab('errors')}
          className={[
            'flex-1 rounded-lg px-3 py-1.5',
            tab === 'errors'
              ? 'bg-[var(--surface)] text-[var(--fg-1)] shadow-sm'
              : 'text-[var(--fg-2)]',
          ].join(' ')}
        >
          Errores comunes
        </button>
      </div>

      {tab === 'matrix' ? (
        <div className="mt-4 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[var(--surface-2)] px-3 py-2 text-left text-xs font-bold text-[var(--fg-2)]">
                  Alumno
                </th>
                {matrix.questions.map((q) => (
                  <th
                    key={q.id}
                    className="px-2 py-2 text-center text-xs font-bold text-[var(--fg-2)]"
                    title={`Pregunta ${questionLabel(q)}`}
                  >
                    {questionLabel(q)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.students.map((st) => (
                <tr key={st.id} className="border-t border-[var(--border)]">
                  <td className="sticky left-0 z-10 max-w-[180px] truncate bg-[var(--surface)] px-3 py-2 font-medium text-[var(--fg-1)]">
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
                            cell
                              ? 'cursor-pointer hover:ring-2 hover:ring-[var(--primary)]/40'
                              : 'cursor-default',
                          ].join(' ')}
                        >
                          <CellGlyph kind={sty.kind} />
                          {cell?.isLate ? (
                            <span
                              className="absolute -right-1.5 -top-1.5 rounded-full bg-[var(--surface)] p-px text-[var(--warning-fg)]"
                              title="Entrega atrasada"
                            >
                              <ClockIcon size={9} strokeWidth={2.5} />
                            </span>
                          ) : null}
                          {cell?.isOverridden ? (
                            <span
                              className="absolute -bottom-1.5 -left-1.5 rounded-full bg-[var(--surface)] p-px text-[var(--primary)]"
                              title="Corregido a mano"
                            >
                              <PencilIcon size={9} strokeWidth={2.5} />
                            </span>
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

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--fg-3)]">
        <span className="inline-flex items-center gap-1">
          <CheckIcon size={13} className="text-mint-600" /> correcto
        </span>
        <span className="inline-flex items-center gap-1">
          <XIcon size={13} className="text-danger" /> incorrecto
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertTriangleIcon size={13} className="text-[var(--warning-fg)]" /> ilegible/sin alinear
        </span>
        <span className="inline-flex items-center gap-1">
          <LoaderIcon size={13} className="text-[var(--primary)]" /> corrigiendo
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>·</span> sin entrega
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon size={13} className="text-[var(--warning-fg)]" /> atrasada
        </span>
        <span className="inline-flex items-center gap-1">
          <PencilIcon size={13} className="text-[var(--primary)]" /> corregido a mano
        </span>
      </div>

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
          <div
            key={q.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <p className="text-sm font-bold text-[var(--fg-1)]">Pregunta {questionLabel(q)}</p>
            {tags.length === 0 ? (
              <p className="mt-1 text-xs text-[var(--fg-3)]">Sin errores registrados.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.code}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--warning-fg)]"
                  >
                    {t.name ?? formatHumanName(t.code)}
                    <span className="math rounded-full bg-[rgba(232,163,61,0.32)] px-1.5 text-[10px] text-[var(--warning-fg)]">
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
    <>
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30"
      />
      <div className="relative z-50 flex h-full w-full max-w-[440px] flex-col gap-4 overflow-auto bg-[var(--surface)] p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
              Entrega · {studentName}
            </p>
            <p className="mt-0.5 text-sm font-bold text-[var(--fg-1)]">
              Intento {cell.attemptNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-[var(--fg-2)] hover:bg-[var(--surface-2)]"
          >
            <XIcon size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--fg-3)]">Cargando…</p>
        ) : !detail ? (
          <p className="text-sm text-danger">No pudimos cargar el detalle.</p>
        ) : (
          <>
            <div className="rounded-xl bg-slate-900 px-4 py-3 text-center">
              <MathText className="leading-relaxed text-white">{detail.statementLatex}</MathText>
            </div>

            {detail.photoUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {detail.photoUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxSrc(url)}
                    className="overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label={`Ampliar foto ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="h-32 w-full object-cover transition-opacity hover:opacity-80"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--fg-3)]">Sin fotos disponibles.</p>
            )}

            {detail.transcriptionLatex ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-3)]">
                  Transcripción
                </p>
                <Latex display>{detail.transcriptionLatex}</Latex>
                {detail.transcriptionConfidence !== null ? (
                  <p className="mt-1 text-[11px] text-[var(--fg-3)]">
                    Confianza {Math.round(detail.transcriptionConfidence * 100)}%
                  </p>
                ) : null}
              </div>
            ) : null}

            {detail.alignmentJson && detail.alignmentJson.length > 0 ? (
              <div className="rounded-xl border border-[var(--border)] px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-3)]">
                  Alineación con la pauta
                </p>
                <ol className="mt-1 flex flex-col gap-1">
                  {detail.alignmentJson.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className={
                          a.verdict === 'ok' || a.verdict === 'correct'
                            ? 'text-mint-600'
                            : 'text-danger'
                        }
                      >
                        {a.verdict === 'ok' || a.verdict === 'correct' ? (
                          <CheckIcon size={14} strokeWidth={2.5} />
                        ) : (
                          <XIcon size={14} strokeWidth={2.5} />
                        )}
                      </span>
                      {a.studentLatex ? <Latex>{a.studentLatex}</Latex> : <span>Paso {i + 1}</span>}
                      {a.note ? <span className="text-[var(--fg-3)]">— {a.note}</span> : null}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {detail.failureReason ? (
              <p className="rounded-xl bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
                {detail.failureReason}
              </p>
            ) : null}

            <div className="rounded-xl border border-[var(--border)] px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-3)]">
                Error asignado
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--fg-1)]">
                {cell.errorTagCode
                  ? cell.errorTagName ?? formatHumanName(cell.errorTagCode)
                  : 'Ninguno'}
                {cell.isOverridden ? (
                  <span className="ml-2 rounded-full bg-[var(--info-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--info-fg)]">
                    corregido a mano
                  </span>
                ) : null}
              </p>

              <p className="mt-3 text-xs text-[var(--fg-2)]">Corregir el error a mano:</p>
              <div className="mt-1">
                <ErrorSearchTypeahead
                  status="ACTIVE"
                  searchFn={searchCatalogErrorsRemote}
                  limit={12}
                  onSelect={(tag) => setPendingTag(tag)}
                  placeholder="Buscar el error correcto…"
                />
              </div>
              {pendingTag ? (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2">
                  <span className="text-sm font-semibold text-[var(--fg-1)]">
                    {pendingTag.name_es}
                  </span>
                  <button
                    type="button"
                    onClick={() => void saveOverride()}
                    disabled={saving}
                    className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] disabled:opacity-40"
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
                  className="mt-2 text-xs font-medium text-[var(--fg-2)] underline-offset-2 hover:underline disabled:opacity-40"
                >
                  Quitar corrección manual
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>

    <ImageLightbox
      open={lightboxSrc !== null}
      src={lightboxSrc}
      onClose={() => setLightboxSrc(null)}
    />
    </>
  );
}
