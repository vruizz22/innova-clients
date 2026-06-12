'use client';

import { useMemo, useState } from 'react';
import { ExerciseCard, type ExerciseCardData } from '@innova/ui';
import type { Difficulty } from '@innova/error-catalog';

/** An item-bank row: ExerciseCard data plus the topic fields used for filtering. */
export interface BankItemView extends ExerciseCardData {
  readonly topicCode: string;
  readonly topicName: string;
}

export interface ExerciseBankClientProps {
  readonly items: readonly BankItemView[];
}

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
const DIFF_LABEL: Record<Difficulty | '', string> = {
  '': 'Toda dificultad',
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
};

export function ExerciseBankClient({ items }: ExerciseBankClientProps): JSX.Element {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  // Distinct topics present in the bank → a real "domain" filter without needing
  // a separate taxonomy endpoint.
  const topics = useMemo(() => {
    const seen = new Map<string, string>();
    for (const it of items) if (!seen.has(it.topicCode)) seen.set(it.topicCode, it.topicName);
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const filtered = items.filter(
    (e) => (!topic || e.topicCode === topic) && (!difficulty || e.difficulty === difficulty)
  );

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">Todos los temas</option>
          {topics.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1">
          {(['', ...DIFFICULTIES] as const).map((d) => (
            <button
              key={d || 'all'}
              type="button"
              onClick={() => setDifficulty(d)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                difficulty === d ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500',
              ].join(' ')}
            >
              {DIFF_LABEL[d]}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {filtered.length} de {items.length} ejercicios
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            canEdit={ex.source === 'TEACHER_AUTHORED'}
            onAssign={(id) => window.alert(`Asignar ${id} → modal curso/alumnos (v8 C3)`)}
            onRequestVariant={(id) => window.alert(`Generar 5 variantes IA de ${id} → DRAFT`)}
          />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">Sin ejercicios para esos filtros.</p>
      ) : null}
    </div>
  );
}
