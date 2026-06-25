'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, toast, XIcon, type ExerciseCardData } from '@innova/ui';
import type { Difficulty } from '@innova/error-catalog';
import type { Classroom, CourseStudentMastery, CatalogError } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { MathText } from '@/components/latex/MathText';
import { ErrorCatalogExplorer } from './ErrorCatalogExplorer';

/** An item-bank row: ExerciseCard data plus the topic and IRT fields. */
export interface BankItemView extends ExerciseCardData {
  readonly topicCode: string;
  readonly topicName: string;
  readonly irtA: number;
  readonly irtB: number;
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
const DIFF_CLS: Record<Difficulty, string> = {
  easy: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
  medium: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
  hard: 'bg-[rgba(216,96,96,0.20)] text-[var(--fg-1)]',
};
const SOURCE_LABEL: Record<string, string> = {
  SYSTEM: 'Sistema',
  TEACHER_AUTHORED: 'Tuyo',
  LLM_GENERATED: 'IA',
  GUIDE_EXTRACTED: 'De guía',
};

const GRADE_LEVELS = Array.from({ length: 12 }, (_, i) => i + 1);
function gradeLabel(g: number): string {
  return g <= 8 ? `${g}° básico` : `${['I', 'II', 'III', 'IV'][g - 9] ?? g}° medio`;
}

/** Extract grade level from error code suffix (e.g. _G7 → 7). */
function gradeFromCode(code: string): number {
  const m = /_G(\d+)$/.exec(code);
  return m && m[1] ? Number(m[1]) : 7;
}

type CoursesState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; courses: Classroom[] }
  | { kind: 'error' };

type StudentsState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; students: CourseStudentMastery[] }
  | { kind: 'error' };

function IccSparkline({ a, b }: { readonly a: number; readonly b: number }): JSX.Element {
  const W = 100;
  const H = 30;
  const STEPS = 50;
  const points = Array.from({ length: STEPS }, (_, i) => {
    const theta = -3 + (6 * i) / (STEPS - 1);
    const p = 1 / (1 + Math.exp(-a * (theta - b)));
    const x = (i / (STEPS - 1)) * W;
    const y = H - p * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const bX = Math.max(0, Math.min(W, ((b + 3) / 6) * W));

  return (
    <div className="rounded-b-xl border-x border-b border-[var(--border)] bg-[var(--surface-2)] px-3 pb-2 pt-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1={bX}
          y1={0}
          x2={bX}
          y2={H}
          stroke="var(--fg-3)"
          strokeWidth="0.75"
          strokeDasharray="2,2"
        />
      </svg>
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[10px] tabular-nums text-[var(--fg-3)]">a={a.toFixed(2)}</span>
        <span className="text-[10px] tabular-nums text-[var(--fg-3)]">b={b.toFixed(2)}</span>
      </div>
    </div>
  );
}

interface BankCardProps {
  readonly item: BankItemView;
  readonly onAssign: (id: string) => void;
}

function BankCard({ item, onAssign }: BankCardProps): JSX.Element {
  const diffCls = DIFF_CLS[item.difficulty];
  const diffLabel = DIFF_LABEL[item.difficulty];
  const isLong = item.prompt.length > 80;
  return (
    <article className="flex flex-col gap-3 rounded-t-xl border border-b-0 border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
      {/* Badges row */}
      <div className="flex items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${diffCls}`}>
          {diffLabel}
        </span>
        <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-2)]">
          {SOURCE_LABEL[item.source] ?? item.source}
        </span>
      </div>

      {/* Prompt */}
      <MathText
        className={[
          'leading-snug text-[var(--fg-1)]',
          isLong ? 'text-sm font-medium' : 'text-base font-bold',
        ].join(' ')}
      >
        {item.prompt}
      </MathText>

      {/* Solution */}
      <p className="text-xs text-[var(--fg-2)]">
        Solución:{' '}
        <MathText className="font-semibold text-[var(--fg-1)]">
          {item.canonicalSolution}
        </MathText>
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
        <span className="text-[11px] text-[var(--fg-3)]">
          {item.usedCount != null ? `Usado ${item.usedCount} veces` : ''}
        </span>
        <button
          type="button"
          onClick={() => onAssign(item.id)}
          className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
        >
          Asignar
        </button>
      </div>
    </article>
  );
}

export function ExerciseBankClient({ items }: ExerciseBankClientProps): JSX.Element {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  // Quick-assign sheet state
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);
  const [coursesState, setCoursesState] = useState<CoursesState>({ kind: 'idle' });
  const [courseId, setCourseId] = useState('');
  const [studentsState, setStudentsState] = useState<StudentsState>({ kind: 'idle' });
  const [selectedStudents, setSelectedStudents] = useState<readonly string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Generate exercises sheet state
  const [genOpen, setGenOpen] = useState(false);
  const [genSelectedErrors, setGenSelectedErrors] = useState<CatalogError[]>([]);
  const [genGrade, setGenGrade] = useState(7);
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  // Derived: subdomain from the first selected error
  const genSubdomain = useMemo(() => {
    const first = genSelectedErrors[0];
    if (!first) return '';
    return first.domainCode && first.subdomainCode
      ? `${first.domainCode}_${first.subdomainCode}`
      : '';
  }, [genSelectedErrors]);

  const toggleError = useCallback((error: CatalogError): void => {
    setGenSelectedErrors((prev) => {
      const already = prev.some((e) => e.code === error.code);
      if (already) return prev.filter((e) => e.code !== error.code);
      if (prev.length === 0) setGenGrade(gradeFromCode(error.code));
      return [...prev, error];
    });
  }, []);

  const removeError = useCallback((code: string): void => {
    setGenSelectedErrors((prev) => prev.filter((e) => e.code !== code));
  }, []);

  const genSelectedCodes = useMemo(
    () => genSelectedErrors.map((e) => e.code),
    [genSelectedErrors]
  );

  const sheetItem = useMemo(
    () => (sheetItemId ? (items.find((it) => it.id === sheetItemId) ?? null) : null),
    [sheetItemId, items]
  );

  const openSheet = useCallback(
    async (itemId: string): Promise<void> => {
      setSheetItemId(itemId);
      setCourseId('');
      setSelectedStudents([]);
      setStudentsState({ kind: 'idle' });
      if (coursesState.kind === 'idle' || coursesState.kind === 'error') {
        setCoursesState({ kind: 'loading' });
        const res = await getBrowserApi().getMyClassrooms();
        setCoursesState(
          res.ok ? { kind: 'ready', courses: res.data } : { kind: 'error' }
        );
      }
    },
    [coursesState.kind]
  );

  const selectCourse = useCallback(async (id: string): Promise<void> => {
    setCourseId(id);
    setSelectedStudents([]);
    if (!id) { setStudentsState({ kind: 'idle' }); return; }
    setStudentsState({ kind: 'loading' });
    const res = await getBrowserApi().getClassroomMastery(id);
    setStudentsState(
      res.ok ? { kind: 'ready', students: res.data } : { kind: 'error' }
    );
  }, []);

  const toggleStudent = useCallback((id: string): void => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const closeSheet = useCallback((): void => {
    if (submitting) return;
    setSheetItemId(null);
  }, [submitting]);

  const closeGenSheet = useCallback((): void => {
    if (generating) return;
    setGenOpen(false);
    setGenSelectedErrors([]);
  }, [generating]);

  const handleAssign = useCallback((): void => {
    if (!sheetItemId || selectedStudents.length === 0) return;
    setSubmitting(true);
    void (async () => {
      const api = getBrowserApi();
      const results = await Promise.all(
        selectedStudents.map((studentId) =>
          api.assignPractice({ studentId, itemIds: [sheetItemId] })
        )
      );
      setSubmitting(false);
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        toast.error(`${failed} asignación${failed === 1 ? '' : 'es'} fallaron. Intenta de nuevo.`);
      } else {
        toast.success(
          `Práctica asignada a ${selectedStudents.length} alumno${selectedStudents.length === 1 ? '' : 's'}.`
        );
        setSheetItemId(null);
        setCourseId('');
        setSelectedStudents([]);
        setStudentsState({ kind: 'idle' });
        router.refresh();
      }
    })();
  }, [sheetItemId, selectedStudents, router]);

  const handleGenerate = useCallback((): void => {
    if (!genSubdomain || genSelectedErrors.length === 0) {
      toast.error('Selecciona al menos un error del catálogo.');
      return;
    }
    setGenerating(true);
    void (async () => {
      const res = await getBrowserApi().generateItems({
        subdomainCode: genSubdomain,
        gradeLevel: genGrade,
        targetErrorCodes: genSelectedCodes,
        count: genCount,
      });
      setGenerating(false);
      if (res.ok) {
        toast.success('Ejercicios en generación. Aparecerán en el banco en unos segundos.');
        setGenOpen(false);
        setGenSelectedErrors([]);
        // Generation is async via SQS — refresh after ~20 s to show new exercises.
        setTimeout(() => router.refresh(), 20_000);
      } else {
        toast.error('No pudimos generar los ejercicios. Intenta de nuevo.');
      }
    })();
  }, [genSubdomain, genGrade, genSelectedErrors.length, genSelectedCodes, genCount, router]);

  const topics = useMemo(() => {
    const seen = new Map<string, string>();
    for (const it of items) if (!seen.has(it.topicCode)) seen.set(it.topicCode, it.topicName);
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const filtered = items.filter(
    (e) => (!topic || e.topicCode === topic) && (!difficulty || e.difficulty === difficulty)
  );

  const courses = coursesState.kind === 'ready' ? coursesState.courses : [];
  const students = studentsState.kind === 'ready' ? studentsState.students : [];
  const allSelected = students.length > 0 && selectedStudents.length === students.length;

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)]"
        >
          <option value="">Todos los temas</option>
          {topics.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <div className="inline-flex gap-1 rounded-full bg-[var(--surface-2)] p-1">
          {(['', ...DIFFICULTIES] as const).map((d) => (
            <button
              key={d || 'all'}
              type="button"
              onClick={() => setDifficulty(d)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                difficulty === d
                  ? 'bg-[var(--surface)] text-[var(--fg-1)] shadow-sm'
                  : 'text-[var(--fg-2)]',
              ].join(' ')}
            >
              {DIFF_LABEL[d]}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--fg-3)]">
          {filtered.length} de {items.length} ejercicios
        </span>
        <button
          type="button"
          onClick={() => setGenOpen(true)}
          className="ml-auto rounded-xl border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/8"
        >
          Generar ejercicios
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <div key={ex.id}>
            <BankCard item={ex} onAssign={(id) => void openSheet(id)} />
            <IccSparkline a={ex.irtA} b={ex.irtB} />
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--fg-3)]">
          Sin ejercicios para esos filtros.
        </p>
      ) : null}

      {/* ── quick-assign sheet ─────────────────────────────────────────────── */}
      <Sheet
        open={sheetItemId !== null}
        onClose={closeSheet}
        title="Asignar ejercicio"
        description={
          sheetItem
            ? `Elige a quién asignar: "${sheetItem.prompt.slice(0, 60)}${sheetItem.prompt.length > 60 ? '…' : ''}"`
            : 'Elige el curso y los alumnos.'
        }
      >
        <label
          htmlFor="qa-course"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]"
        >
          Curso
        </label>
        {coursesState.kind === 'loading' ? (
          <div className="mb-4 h-10 animate-pulse rounded-xl bg-[var(--surface-2)]" />
        ) : coursesState.kind === 'error' ? (
          <p className="mb-4 text-sm text-[var(--error-fg)]">No pudimos cargar los cursos.</p>
        ) : (
          <select
            id="qa-course"
            value={courseId}
            onChange={(e) => void selectCourse(e.target.value)}
            className="mb-4 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15"
          >
            <option value="">— Elige un curso —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {studentsState.kind === 'loading' ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-[var(--surface-2)]" />
            ))}
          </div>
        ) : studentsState.kind === 'error' ? (
          <p className="text-sm text-[var(--error-fg)]">No pudimos cargar los alumnos.</p>
        ) : studentsState.kind === 'ready' && students.length === 0 ? (
          <p className="text-sm text-[var(--fg-3)]">Este curso no tiene alumnos todavía.</p>
        ) : studentsState.kind === 'ready' ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                Alumnos ({students.length})
              </p>
              <button
                type="button"
                onClick={() =>
                  setSelectedStudents(allSelected ? [] : students.map((s) => s.studentId))
                }
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {students.map((s) => {
                const checked = selectedStudents.includes(s.studentId);
                return (
                  <label
                    key={s.studentId}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors',
                      checked
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(s.studentId)}
                      className="h-4 w-4 rounded accent-[var(--primary)]"
                    />
                    <span className="text-sm font-semibold text-[var(--fg-1)]">
                      {s.displayName}
                    </span>
                    <span className="ml-auto tabular-nums text-xs text-[var(--fg-3)]">
                      {s.attempts.length} intentos
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={closeSheet}
            disabled={submitting}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={submitting || selectedStudents.length === 0}
            className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? 'Asignando…'
              : `Asignar a ${selectedStudents.length} alumno${selectedStudents.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </Sheet>

      {/* ── generate exercises sheet ───────────────────────────────────────── */}
      <Sheet
        open={genOpen}
        onClose={closeGenSheet}
        title="Generar ejercicios con IA"
        description="Busca errores del catálogo en español. La IA creará ejercicios que provocan esos errores."
      >
        <div className="flex flex-col gap-4">
          {/* Error picker */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
              Errores objetivo
            </p>

            {/* Selected error chips */}
            {genSelectedErrors.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {genSelectedErrors.map((e) => (
                  <span
                    key={e.code}
                    className="flex items-center gap-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/8 py-0.5 pl-2.5 pr-1.5 text-xs font-semibold text-[var(--primary)]"
                  >
                    {e.name ?? e.code}
                    <button
                      type="button"
                      onClick={() => removeError(e.code)}
                      aria-label={`Quitar ${e.name ?? e.code}`}
                      className="rounded-full p-0.5 hover:bg-[var(--primary)]/15"
                    >
                      <XIcon size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <ErrorCatalogExplorer
              onToggle={toggleError}
              selectedCodes={genSelectedCodes}
            />
          </div>

          {/* Subdomain (read-only, auto-derived) */}
          {genSubdomain ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-3)]">
                Subdominio detectado
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-[var(--fg-1)]">
                {genSubdomain}
              </p>
            </div>
          ) : null}

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                Nivel escolar
              </span>
              <select
                value={genGrade}
                onChange={(e) => setGenGrade(Number(e.target.value))}
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {gradeLabel(g)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                Cantidad
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={genCount}
                onChange={(e) => setGenCount(Math.min(10, Math.max(1, Number(e.target.value))))}
                className="h-10 w-20 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm tabular-nums text-[var(--fg-1)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={closeGenSheet}
            disabled={generating}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || genSelectedErrors.length === 0}
            className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? 'Enviando…' : `Generar ${genCount} ejercicio${genCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
