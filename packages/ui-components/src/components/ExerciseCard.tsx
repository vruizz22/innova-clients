'use client';

import React from 'react';
import type { Difficulty, ExerciseSource } from '@innova/error-catalog';
import { ErrorTagChip } from './ErrorTagChip';

export interface ExerciseCardData {
  id: string;
  prompt: string;
  canonicalSolution: string;
  targetErrorTags: string[];
  difficulty: Difficulty;
  source: ExerciseSource;
  usedCount?: number;
}

interface ExerciseCardProps {
  exercise: ExerciseCardData;
  onAssign?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRequestVariant?: (id: string) => void;
  /** Only TEACHER_AUTHORED exercises owned by the teacher are editable (v8 C3). */
  canEdit?: boolean;
  className?: string;
}

const DIFFICULTY: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: 'Fácil', cls: 'bg-[var(--success-bg)] text-[var(--success-fg)]' },
  medium: { label: 'Media', cls: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' },
  hard: { label: 'Difícil', cls: 'bg-[rgba(216,96,96,0.20)] text-[var(--fg-1)]' },
};

const SOURCE_LABEL: Record<ExerciseSource, string> = {
  SYSTEM: 'Sistema',
  TEACHER_AUTHORED: 'Tuyo',
  LLM_GENERATED: 'IA',
};

export function ExerciseCard({
  exercise,
  onAssign,
  onEdit,
  onRequestVariant,
  canEdit = false,
  className = '',
}: ExerciseCardProps): JSX.Element {
  const diff = DIFFICULTY[exercise.difficulty];

  return (
    <article
      className={[
        'flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="math text-lg font-bold text-[var(--fg-1)]">{exercise.prompt}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${diff.cls}`}>
            {diff.label}
          </span>
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-2)]">
            {SOURCE_LABEL[exercise.source]}
          </span>
        </div>
      </div>

      <p className="text-sm text-[var(--fg-2)]">
        Solución:{' '}
        <span className="math font-semibold text-[var(--fg-1)]">{exercise.canonicalSolution}</span>
      </p>

      {exercise.targetErrorTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {exercise.targetErrorTags.map((code) => (
            <ErrorTagChip key={code} code={code} />
          ))}
        </div>
      ) : null}

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
        <span className="text-[11px] text-[var(--fg-3)]">
          {exercise.usedCount != null ? `Usado ${exercise.usedCount} veces` : ''}
        </span>
        <div className="flex items-center gap-2">
          {onRequestVariant ? (
            <button
              type="button"
              onClick={() => onRequestVariant(exercise.id)}
              className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Variante IA
            </button>
          ) : null}
          {canEdit && onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(exercise.id)}
              className="text-xs font-semibold text-[var(--fg-2)] hover:text-[var(--fg-1)]"
            >
              Editar
            </button>
          ) : null}
          {onAssign ? (
            <button
              type="button"
              onClick={() => onAssign(exercise.id)}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
            >
              Asignar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
