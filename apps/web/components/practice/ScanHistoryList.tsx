'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CameraIcon, CheckCircleIcon, AlertTriangleIcon, LoaderIcon, EmptyState } from '@innova/ui';
import { formatHumanName } from '@innova/error-catalog';
import { Latex } from '@/components/latex/Latex';
import type { ScanHistoryEntry, ScanHistoryExercise } from './ScanFlow';

const SCAN_HISTORY_KEY = 'innova_scan_history_v1';

const CORRECT_CODES = new Set(['CORRECT', 'NONE', '']);
const PENDING_CODES = new Set(['UNCLASSIFIED', 'PENDING']);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ExerciseDetail({ ex, index }: { readonly ex: ScanHistoryExercise; readonly index: number }): JSX.Element {
  const isPending = !ex.isCorrect && PENDING_CODES.has(ex.errorTagCode ?? '');
  const isError = !ex.isCorrect && !isPending && !CORRECT_CODES.has(ex.errorTagCode ?? '');
  const errorLabel = ex.errorTagName ?? (ex.errorTagCode ? formatHumanName(ex.errorTagCode) : null);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--fg-3)]">
          Ejercicio {index + 1}
        </span>
        <span className="text-[11px] text-[var(--fg-3)]">
          Confianza {Math.round(ex.confidence * 100)}%
          {ex.topicHint ? ` · ${ex.topicHint}` : ''}
        </span>
      </div>

      {/* Problem */}
      <div className="mb-3">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-3)]">Problema</p>
        <Latex className="text-sm font-semibold text-[var(--fg-1)]">
          {ex.problem || '{-}'}
        </Latex>
      </div>

      {/* Work steps — each line is independent LaTeX */}
      {ex.work ? (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-3)]">Tu desarrollo</p>
          <div className="flex flex-col gap-1 rounded-lg bg-[var(--surface)] px-3 py-2">
            {ex.work.split('\n').filter(Boolean).map((line, i) => (
              <Latex key={i} className="text-sm text-[var(--fg-2)]">
                {line}
              </Latex>
            ))}
          </div>
        </div>
      ) : null}

      {/* Final answer */}
      <div className="mb-3">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-3)]">Tu respuesta</p>
        <Latex className="text-sm font-semibold text-[var(--fg-1)]">
          {ex.finalAnswer || '{-}'}
        </Latex>
      </div>

      {/* Result */}
      <div
        className={[
          'flex items-center gap-2 rounded-xl px-3 py-2.5',
          ex.isCorrect
            ? 'bg-[var(--success-bg)]'
            : isPending
            ? 'bg-[var(--info-bg)]'
            : 'bg-[var(--warning-bg)]',
        ].join(' ')}
      >
        {ex.isCorrect ? (
          <>
            <CheckCircleIcon size={16} className="shrink-0 text-[var(--success-fg)]" />
            <span className="text-sm font-bold text-[var(--success-fg)]">¡Correcto!</span>
          </>
        ) : isPending ? (
          <>
            <LoaderIcon size={16} className="shrink-0 text-[var(--info-fg)]" />
            <span className="text-sm font-bold text-[var(--info-fg)]">Pendiente de análisis</span>
          </>
        ) : (
          <>
            <AlertTriangleIcon size={16} className="shrink-0 text-[var(--warning-fg)]" />
            <span className="text-sm font-bold text-[var(--warning-fg)]">
              {isError && errorLabel ? `Error: ${errorLabel}` : 'Casi lo tienes'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry }: { readonly entry: ScanHistoryEntry }): JSX.Element {
  const [open, setOpen] = useState(false);
  const incorrect = entry.total - entry.correct;
  const allCorrect = incorrect === 0;
  const pct = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-card">
      {/* Summary row — click to expand */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-2)]"
      >
        <div
          className={[
            'h-2.5 w-2.5 shrink-0 rounded-full',
            allCorrect
              ? 'bg-[var(--success-fg)]'
              : pct >= 60
              ? 'bg-[var(--warning-fg)]'
              : 'bg-[rgba(216,96,96,0.8)]',
          ].join(' ')}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--fg-1)]">
            {entry.total} ejercicio{entry.total !== 1 ? 's' : ''}
            {entry.topics.length > 0 ? ` · ${entry.topics.slice(0, 2).join(', ')}` : ''}
          </p>
          <p className="mt-0.5 text-xs text-[var(--fg-3)]">{formatDate(entry.date)}</p>
        </div>

        <span
          className={[
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
            allCorrect
              ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
              : pct >= 60
              ? 'bg-[var(--warning-bg)] text-[var(--warning-fg)]'
              : 'bg-[rgba(216,96,96,0.15)] text-[var(--fg-1)]',
          ].join(' ')}
        >
          {entry.correct}/{entry.total}
        </span>

        <span className="shrink-0 text-xs text-[var(--fg-3)]">{open ? '▲' : '▼'}</span>
      </button>

      {/* Detail panel */}
      {open ? (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 pb-4 pt-3">
          {entry.exercises && entry.exercises.length > 0 ? (
            entry.exercises.map((ex, i) => (
              <ExerciseDetail key={`${entry.id}-${i}`} ex={ex} index={i} />
            ))
          ) : (
            <p className="text-sm text-[var(--fg-3)]">
              No hay detalles guardados para este escaneo.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ScanHistoryList(): JSX.Element {
  const [entries, setEntries] = useState<ScanHistoryEntry[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCAN_HISTORY_KEY);
      setEntries(raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  if (entries === null) {
    return (
      <div className="mt-8 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        kind="no-exercises"
        title="Aún no tienes escaneos"
        body="Cuando escanees tu guía resuelta, aparecerá aquí con fecha, tema y resultado."
        action={
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            <CameraIcon size={16} />
            Escanear mi primera guía
          </Link>
        }
        className="mt-8"
      />
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {entries.map((entry) => (
        <HistoryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
