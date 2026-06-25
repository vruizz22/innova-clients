'use client';

import { useState, useCallback, useMemo } from 'react';
import { EmptyState, toast } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import type { CourseStudentMastery, RecommendResult } from '@innova/api-client';
import type { BankItemView } from './ExerciseBankClient';
import { MathText } from '@/components/latex/MathText';
import { wrapMath } from '@/lib/math';

interface CourseOption {
  readonly id: string;
  readonly name: string;
}

interface Props {
  readonly courses: readonly CourseOption[];
  readonly items: readonly BankItemView[];
  readonly defaultItemId?: string;
}

type Step = 1 | 2 | 3;
type AssignMode = 'bank' | 'irt';

interface Selection {
  readonly courseId: string;
  readonly studentIds: readonly string[];
  readonly itemId: string;
}

const EMPTY: Selection = { courseId: '', studentIds: [], itemId: '' };

type MasteryState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly students: readonly CourseStudentMastery[] }
  | { readonly kind: 'error' };

type IrtState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly recs: Readonly<Record<string, RecommendResult>> }
  | { readonly kind: 'error' };

function fisherInfo(a: number, b: number, theta: number): number {
  const p = 1 / (1 + Math.exp(-a * (theta - b)));
  return a * a * p * (1 - p);
}

function StepIndicator({ current, total }: { readonly current: Step; readonly total: number }): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={[
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular-nums',
              n === current
                ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                : n < current
                  ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
                  : 'bg-[var(--surface-2)] text-[var(--fg-3)]',
            ].join(' ')}
          >
            {n}
          </div>
          {n < total ? (
            <div
              className={[
                'h-px w-8',
                n < current ? 'bg-[var(--success-fg)]' : 'bg-[var(--border)]',
              ].join(' ')}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function AssignPracticeClient({ courses, items, defaultItemId }: Props): JSX.Element {
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<AssignMode>('bank');
  const [sel, setSel] = useState<Selection>(() =>
    defaultItemId ? { ...EMPTY, itemId: defaultItemId } : EMPTY
  );
  const [mastery, setMastery] = useState<MasteryState>({ kind: 'idle' });
  const [irtState, setIrtState] = useState<IrtState>({ kind: 'idle' });
  const [irtIncluded, setIrtIncluded] = useState<readonly string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = useCallback(async (courseId: string): Promise<void> => {
    setMastery({ kind: 'loading' });
    const res = await getBrowserApi().getClassroomMastery(courseId);
    setMastery(res.ok ? { kind: 'ready', students: res.data } : { kind: 'error' });
  }, []);

  const loadIrtRecs = useCallback(async (courseId: string, studentIds: readonly string[]): Promise<void> => {
    setIrtState({ kind: 'loading' });
    const api = getBrowserApi();
    const entries = await Promise.all(
      studentIds.map(async (studentId) => {
        const res = await api.recommendNextExercise(courseId, studentId);
        return [studentId, res.ok ? res.data : null] as const;
      })
    );
    const recs: Record<string, RecommendResult> = {};
    for (const [id, rec] of entries) {
      if (rec) recs[id] = rec;
    }
    if (Object.keys(recs).length === 0) {
      setIrtState({ kind: 'error' });
    } else {
      setIrtState({ kind: 'ready', recs });
      setIrtIncluded(Object.keys(recs));
    }
  }, []);

  const students = mastery.kind === 'ready' ? mastery.students : [];

  const selectedItem = useMemo(
    () => items.find((it) => it.id === sel.itemId) ?? null,
    [items, sel.itemId]
  );

  function toggleStudent(id: string): void {
    setSel((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((s) => s !== id)
        : [...prev.studentIds, id],
    }));
  }

  function toggleIrtIncluded(id: string): void {
    setIrtIncluded((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleModeChange(newMode: AssignMode): void {
    setMode(newMode);
    if (newMode === 'irt' && irtState.kind === 'idle' && sel.courseId && sel.studentIds.length > 0) {
      void loadIrtRecs(sel.courseId, sel.studentIds);
    }
  }

  function handleAssign(): void {
    setSubmitting(true);
    void (async () => {
      const api = getBrowserApi();

      if (mode === 'irt') {
        if (irtState.kind !== 'ready') {
          setSubmitting(false);
          return;
        }
        const results = await Promise.all(
          irtIncluded.map((studentId) => {
            const rec = irtState.recs[studentId];
            if (!rec) return Promise.resolve({ ok: false } as { ok: false; error: string });
            return api.assignPractice({ studentId, itemIds: [rec.exercise.id] });
          })
        );
        setSubmitting(false);
        const failed = results.filter((r) => !r.ok).length;
        if (failed > 0) {
          toast.error(`${failed} asignación${failed === 1 ? '' : 'es'} fallaron. Intenta de nuevo.`);
        } else {
          toast.success(
            `Práctica IRT asignada a ${irtIncluded.length} alumno${irtIncluded.length === 1 ? '' : 's'}.`
          );
          setSel(EMPTY);
          setStep(1);
          setMastery({ kind: 'idle' });
          setIrtState({ kind: 'idle' });
          setIrtIncluded([]);
          setMode('bank');
        }
        return;
      }

      const results = await Promise.all(
        sel.studentIds.map((studentId) =>
          api.assignPractice({ studentId, itemIds: [sel.itemId] })
        )
      );
      setSubmitting(false);
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        toast.error(`${failed} asignación${failed === 1 ? '' : 'es'} fallaron. Intenta de nuevo.`);
      } else {
        toast.success(
          `Práctica asignada a ${sel.studentIds.length} alumno${sel.studentIds.length === 1 ? '' : 's'}.`
        );
        setSel(EMPTY);
        setStep(1);
        setMastery({ kind: 'idle' });
      }
    })();
  }

  const step1Complete = sel.courseId && sel.studentIds.length > 0;
  const step2Complete =
    mode === 'bank'
      ? !!sel.itemId
      : irtState.kind === 'ready' && irtIncluded.length > 0;

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-6">
        <StepIndicator current={step} total={3} />
      </div>

      {/* Step 1: Alumnos */}
      {step === 1 ? (
        <section>
          <h2 className="mb-1 text-base font-bold text-[var(--fg-1)]">1. Selecciona alumnos</h2>
          <p className="mb-4 text-sm text-[var(--fg-2)]">
            Elige el curso y marca los alumnos que recibirán la práctica.
          </p>

          <label
            htmlFor="ap-course"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]"
          >
            Curso
          </label>
          <select
            id="ap-course"
            value={sel.courseId}
            onChange={(e) => {
              const id = e.target.value;
              setSel({ ...EMPTY, courseId: id });
              setIrtState({ kind: 'idle' });
              setIrtIncluded([]);
              if (id) void loadStudents(id);
            }}
            className="mb-4 h-10 w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15"
          >
            <option value="">— Elige un curso —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {mastery.kind === 'loading' ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--surface-2)]" />
              ))}
            </div>
          ) : mastery.kind === 'error' ? (
            <EmptyState kind="error" title="No pudimos cargar los alumnos" />
          ) : mastery.kind === 'ready' && students.length === 0 ? (
            <EmptyState kind="no-data" title="Este curso no tiene alumnos todavía." />
          ) : mastery.kind === 'ready' ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                  Alumnos ({students.length})
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setSel((prev) => ({
                      ...prev,
                      studentIds:
                        prev.studentIds.length === students.length
                          ? []
                          : students.map((s) => s.studentId),
                    }))
                  }
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  {sel.studentIds.length === students.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {students.map((s) => {
                  const checked = sel.studentIds.includes(s.studentId);
                  return (
                    <label
                      key={s.studentId}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
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
                      <span className="ml-auto text-xs text-[var(--fg-3)] tabular-nums">
                        {s.attempts.length} intentos
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!step1Complete}
              onClick={() => setStep(2)}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </section>
      ) : null}

      {/* Step 2: Ejercicio */}
      {step === 2 ? (
        <section>
          <h2 className="mb-1 text-base font-bold text-[var(--fg-1)]">2. Elige un ejercicio</h2>
          <p className="mb-4 text-sm text-[var(--fg-2)]">
            Selecciona del banco o usa la recomendación IRT por alumno.
          </p>

          {/* Mode toggle */}
          <div className="mb-5 flex rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
            <button
              type="button"
              onClick={() => handleModeChange('bank')}
              className={[
                'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                mode === 'bank'
                  ? 'bg-[var(--surface)] text-[var(--fg-1)] shadow-sm'
                  : 'text-[var(--fg-3)] hover:text-[var(--fg-1)]',
              ].join(' ')}
            >
              Banco de ejercicios
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('irt')}
              className={[
                'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                mode === 'irt'
                  ? 'bg-[var(--surface)] text-[var(--fg-1)] shadow-sm'
                  : 'text-[var(--fg-3)] hover:text-[var(--fg-1)]',
              ].join(' ')}
            >
              Recomendado por IRT
            </button>
          </div>

          {/* Bank panel */}
          {mode === 'bank' ? (
            items.length === 0 ? (
              <EmptyState
                kind="no-data"
                title="El banco está vacío"
                body="Aún no hay ejercicios disponibles. Pide al admin que genere o importe ejercicios."
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                {items.map((it) => {
                  const checked = sel.itemId === it.id;
                  return (
                    <label
                      key={it.id}
                      className={[
                        'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                        checked
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="item"
                        value={it.id}
                        checked={checked}
                        onChange={() => setSel((prev) => ({ ...prev, itemId: it.id }))}
                        className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                      />
                      <span className="min-w-0 flex-1">
                        <MathText className="block text-sm font-semibold text-[var(--fg-1)]">
                          {it.prompt}
                        </MathText>
                        <span className="mt-0.5 text-xs text-[var(--fg-3)]">
                          {it.topicName} · {it.difficulty === 'easy' ? 'Fácil' : it.difficulty === 'medium' ? 'Media' : 'Difícil'}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )
          ) : null}

          {/* IRT panel */}
          {mode === 'irt' ? (
            irtState.kind === 'loading' ? (
              <div className="flex flex-col gap-2">
                {sel.studentIds.map((id) => (
                  <div key={id} className="h-20 animate-pulse rounded-xl bg-[var(--surface-2)]" />
                ))}
              </div>
            ) : irtState.kind === 'error' ? (
              <EmptyState
                kind="error"
                title="No pudimos cargar las recomendaciones"
                body="Verifica que el banco tenga ejercicios y que los alumnos tengan intentos."
              />
            ) : irtState.kind === 'ready' ? (
              <>
                {/* Quick filters */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                    Incluir:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setIrtIncluded(
                        Object.entries(irtState.recs)
                          .filter(([, rec]) => rec.studentTheta < 0)
                          .map(([id]) => id)
                      )
                    }
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--fg-2)] hover:border-[var(--warning-fg)] hover:text-[var(--warning-fg)]"
                  >
                    Solo en riesgo (θ &lt; 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIrtIncluded(Object.keys(irtState.recs))}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--fg-2)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setIrtIncluded([])}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--fg-2)] hover:border-[var(--fg-3)] hover:text-[var(--fg-3)]"
                  >
                    Limpiar
                  </button>
                </div>

                {/* Per-student IRT cards */}
                <div className="flex flex-col gap-2">
                  {sel.studentIds.map((studentId) => {
                    const rec = irtState.recs[studentId];
                    const student = students.find((s) => s.studentId === studentId);
                    if (!rec) return null;
                    const fi = fisherInfo(rec.exercise.irtA, rec.exercise.irtB, rec.studentTheta);
                    const included = irtIncluded.includes(studentId);
                    const atRisk = rec.studentTheta < 0;
                    return (
                      <label
                        key={studentId}
                        className={[
                          'flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors',
                          included
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--border)] bg-[var(--surface)] opacity-60',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={included}
                          onChange={() => toggleIrtIncluded(studentId)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--primary)]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--fg-1)]">
                              {student?.displayName ?? studentId}
                            </span>
                            {atRisk ? (
                              <span className="rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--warning-fg)]">
                                En riesgo
                              </span>
                            ) : null}
                            <span className="ml-auto text-xs text-[var(--fg-3)] tabular-nums">
                              θ = {rec.studentTheta.toFixed(2)}
                            </span>
                          </div>
                          <MathText className="mt-1 block text-xs text-[var(--fg-1)]">
                            {wrapMath(rec.exercise.problem)}
                          </MathText>
                          <p className="mt-0.5 text-[10px] text-[var(--fg-3)] tabular-nums">
                            {rec.exercise.topicName} · a={rec.exercise.irtA.toFixed(2)} · b={rec.exercise.irtB.toFixed(2)} · I(θ)={fi.toFixed(3)}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--fg-3)]">
                Cargando recomendaciones…
              </p>
            )
          ) : null}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--fg-2)] hover:bg-[var(--surface-2)]"
            >
              ← Atrás
            </button>
            <button
              type="button"
              disabled={!step2Complete}
              onClick={() => setStep(3)}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Revisar →
            </button>
          </div>
        </section>
      ) : null}

      {/* Step 3: Review */}
      {step === 3 ? (
        <section>
          <h2 className="mb-1 text-base font-bold text-[var(--fg-1)]">3. Revisar y confirmar</h2>
          <p className="mb-4 text-sm text-[var(--fg-2)]">
            Confirma los detalles antes de asignar la práctica.
          </p>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-3)]">Alumnos</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--fg-1)]">
                {mode === 'irt' ? irtIncluded.length : sel.studentIds.length}{' '}
                alumno{(mode === 'irt' ? irtIncluded.length : sel.studentIds.length) === 1 ? '' : 's'} del curso{' '}
                <span className="font-bold">
                  {courses.find((c) => c.id === sel.courseId)?.name ?? sel.courseId}
                </span>
              </p>
            </div>

            {mode === 'bank' && selectedItem ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-3)]">Ejercicio</p>
                <MathText className="mt-0.5 block text-sm font-semibold text-[var(--fg-1)]">
                  {selectedItem.prompt}
                </MathText>
                <p className="mt-0.5 text-xs text-[var(--fg-3)]">
                  {selectedItem.topicName} · a={selectedItem.irtA?.toFixed(2) ?? '—'} · b={selectedItem.irtB?.toFixed(2) ?? '—'}
                </p>
              </div>
            ) : null}

            {mode === 'irt' && irtState.kind === 'ready' ? (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--fg-3)]">
                  Ejercicios por alumno (IRT)
                </p>
                <div className="flex flex-col gap-1.5">
                  {irtIncluded.map((studentId) => {
                    const rec = irtState.recs[studentId];
                    const student = students.find((s) => s.studentId === studentId);
                    if (!rec) return null;
                    return (
                      <div
                        key={studentId}
                        className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--fg-1)]">
                            {student?.displayName ?? studentId}
                            <span className="ml-2 font-normal text-[var(--fg-3)] tabular-nums">
                              θ={rec.studentTheta.toFixed(2)}
                            </span>
                          </p>
                          <MathText className="mt-0.5 block text-xs text-[var(--fg-2)]">
                            {wrapMath(rec.exercise.problem)}
                          </MathText>
                          <p className="mt-0.5 text-[10px] text-[var(--fg-3)]">
                            {rec.exercise.topicName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--fg-2)] hover:bg-[var(--surface-2)] disabled:opacity-40"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={submitting}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Asignando…' : 'Asignar práctica'}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
