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
  easy: { label: 'Fácil', cls: 'bg-[#D2F2E0] text-[#194E34]' },
  medium: { label: 'Media', cls: 'bg-[#FFF4DB] text-[#7A4F00]' },
  hard: { label: 'Difícil', cls: 'bg-[#FCE3E3] text-[#7a1a1a]' },
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
      className={['flex flex-col gap-3 rounded-xl border border-[#E5E9F0] bg-white p-5 shadow-card', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="math text-lg font-bold text-[#1F2937]">{exercise.prompt}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${diff.cls}`}>
            {diff.label}
          </span>
          <span className="rounded-full bg-[#F7F8FA] px-2 py-0.5 text-[11px] font-semibold text-[#4F5868]">
            {SOURCE_LABEL[exercise.source]}
          </span>
        </div>
      </div>

      <p className="text-sm text-[#4F5868]">
        Solución: <span className="math font-semibold text-[#1F2937]">{exercise.canonicalSolution}</span>
      </p>

      {exercise.targetErrorTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {exercise.targetErrorTags.map((code) => (
            <ErrorTagChip key={code} code={code} />
          ))}
        </div>
      ) : null}

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-[#E5E9F0] pt-3">
        <span className="text-[11px] text-[#717A8B]">
          {exercise.usedCount != null ? `Usado ${exercise.usedCount} veces` : ''}
        </span>
        <div className="flex items-center gap-2">
          {onRequestVariant ? (
            <button
              type="button"
              onClick={() => onRequestVariant(exercise.id)}
              className="text-xs font-semibold text-[#2F8DBA] hover:text-[#226E94]"
            >
              Variante IA
            </button>
          ) : null}
          {canEdit && onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(exercise.id)}
              className="text-xs font-semibold text-[#4F5868] hover:text-[#1F2937]"
            >
              Editar
            </button>
          ) : null}
          {onAssign ? (
            <button
              type="button"
              onClick={() => onAssign(exercise.id)}
              className="rounded-lg bg-[#3FA7D6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2F8DBA]"
            >
              Asignar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
