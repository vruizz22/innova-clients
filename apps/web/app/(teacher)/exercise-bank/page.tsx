'use client';

import { useState } from 'react';
import { ExerciseCard, type ExerciseCardData } from '@innova/ui';
import { DOMAINS, GRADES, gradeLabel, type Difficulty, type Grade } from '@innova/error-catalog';

interface BankExercise extends ExerciseCardData {
  domainCode: string;
  grade: Grade;
}

// Mock bank until GET /items (exercise-bank) is wired (v8 C3). Tags are real seed codes.
const EXERCISES: BankExercise[] = [
  { id: 'e1', domainCode: 'ARITHMETIC', grade: 'G3', prompt: '53 − 26', canonicalSolution: '27', difficulty: 'medium', source: 'SYSTEM', usedCount: 312, targetErrorTags: ['ARITH_SUB_BORROW_OMITTED_TENS_G3', 'ARITH_SUB_MINUEND_SWAPPED_G3'] },
  { id: 'e2', domainCode: 'ARITHMETIC', grade: 'G3', prompt: '38 + 27', canonicalSolution: '65', difficulty: 'easy', source: 'SYSTEM', usedCount: 188, targetErrorTags: ['ARITH_ADD_CARRY_OMITTED_G3'] },
  { id: 'e3', domainCode: 'FRACTIONS', grade: 'G5', prompt: '2/5 + 1/5', canonicalSolution: '3/5', difficulty: 'medium', source: 'SYSTEM', usedCount: 96, targetErrorTags: ['FRACT_ADDSAME_SUM_DENOMINATORS_G5'] },
  { id: 'e4', domainCode: 'FRACTIONS', grade: 'G6', prompt: '1/2 + 1/3', canonicalSolution: '5/6', difficulty: 'hard', source: 'LLM_GENERATED', usedCount: 41, targetErrorTags: ['FRACT_ADDDIFF_COMMON_DENOM_MISSED_G6', 'FRACT_ADDDIFF_WRONG_LCM_G6'] },
  { id: 'e5', domainCode: 'ALGEBRA_LINEAR', grade: 'G8', prompt: 'x + 5 = 12', canonicalSolution: 'x = 7', difficulty: 'medium', source: 'TEACHER_AUTHORED', usedCount: 12, targetErrorTags: ['ALG_LIN_SIGN_FLIP_TRANSPOSE_G8'] },
  { id: 'e6', domainCode: 'EXPONENTS_RADICALS', grade: 'G8', prompt: 'x² · x³', canonicalSolution: 'x⁵', difficulty: 'medium', source: 'LLM_GENERATED', usedCount: 22, targetErrorTags: ['EXP_LAW_MULTIPLY_EXPONENTS_G8'] },
  { id: 'e7', domainCode: 'TRIGONOMETRY', grade: 'G11', prompt: 'sin²θ + cos²θ', canonicalSolution: '1', difficulty: 'hard', source: 'LLM_GENERATED', usedCount: 8, targetErrorTags: ['TRIG_IDENTITY_PYTHAGOREAN_WRONG_G11'] },
  { id: 'e8', domainCode: 'LOGARITHMS', grade: 'G11', prompt: 'log(2·5)', canonicalSolution: 'log2 + log5', difficulty: 'hard', source: 'SYSTEM', usedCount: 17, targetErrorTags: ['LOG_PRODUCT_TO_SUM_INV_G11'] },
];

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function ExerciseBankPage(): JSX.Element {
  const [domain, setDomain] = useState('');
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  const filtered = EXERCISES.filter(
    (e) =>
      (!domain || e.domainCode === domain) &&
      (!grade || e.grade === grade) &&
      (!difficulty || e.difficulty === difficulty),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Banco de ejercicios</h1>
      <p className="mt-1 text-sm text-slate-500">
        Filtra por dominio, grado y dificultad. Asigna o pide variantes con IA.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">Todos los dominios</option>
          {DOMAINS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name_es}
            </option>
          ))}
        </select>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          <option value="">Todos los grados</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {gradeLabel(g)}
            </option>
          ))}
        </select>
        <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1">
          {(['', ...DIFFICULTIES] as const).map((d) => (
            <button
              key={d || 'all'}
              onClick={() => setDifficulty(d)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                difficulty === d ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500',
              ].join(' ')}
            >
              {d === '' ? 'Toda dificultad' : d === 'easy' ? 'Fácil' : d === 'medium' ? 'Media' : 'Difícil'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            canEdit={ex.source === 'TEACHER_AUTHORED'}
            onAssign={(id) => alert(`Asignar ${id} → modal curso/alumnos (v8 C3)`)}
            onEdit={(id) => alert(`Editar ${id}`)}
            onRequestVariant={(id) => alert(`Generar 5 variantes IA de ${id} → DRAFT`)}
          />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">
          Sin ejercicios para esos filtros.
        </p>
      ) : null}
    </div>
  );
}
