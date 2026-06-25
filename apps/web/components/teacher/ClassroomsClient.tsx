'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, EmptyState, Sheet, UsersIcon, XIcon, toast } from '@innova/ui';
import type { CourseStudentMastery } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { masteryLevel, MASTERY_LABEL } from '@/lib/mastery-color';
import { InviteStudentsButton } from './InviteStudentsButton';

export interface ClassroomRow {
  readonly id: string;
  readonly name: string;
  readonly gradeLevel: number;
  readonly letter?: string | null;
}

function gradeLabel(level: number, letter?: string | null): string {
  const grade =
    level <= 8
      ? `${level}° básico`
      : `${(['I', 'II', 'III', 'IV'] as const)[level - 9] ?? `${level - 8}°`} medio`;
  return letter ? `${grade} ${letter.toUpperCase()}` : grade;
}

interface Props {
  readonly classrooms: readonly ClassroomRow[];
}

type RosterState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly students: readonly CourseStudentMastery[] }
  | { readonly kind: 'error' };

interface CourseCardProps {
  readonly classroom: ClassroomRow;
}

function CourseCard({ classroom }: CourseCardProps): JSX.Element {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [roster, setRoster] = useState<RosterState>({ kind: 'idle' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async (): Promise<void> => {
    setDeleting(true);
    const res = await getBrowserApi().deleteClassroom(classroom.id);
    setDeleting(false);
    if (res.ok) {
      toast.success('Curso archivado');
      setDeleteOpen(false);
      router.refresh();
    } else {
      toast.error('No pudimos archivar el curso. Intenta de nuevo.');
    }
  }, [classroom.id, router]);

  const toggle = useCallback(async (): Promise<void> => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (roster.kind !== 'idle') return;
    setRoster({ kind: 'loading' });
    const res = await getBrowserApi().getClassroomMastery(classroom.id);
    setRoster(res.ok ? { kind: 'ready', students: res.data } : { kind: 'error' });
  }, [expanded, classroom.id, roster.kind]);

  const students = roster.kind === 'ready' ? roster.students : [];

  return (
    <>
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => void toggle()}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronRightIcon
            size={18}
            className={[
              'shrink-0 text-[var(--fg-3)] transition-transform duration-150',
              expanded ? 'rotate-90' : '',
            ].join(' ')}
          />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[var(--fg-1)]">{classroom.name}</p>
            <p className="text-xs text-[var(--fg-3)]">
              {gradeLabel(classroom.gradeLevel, classroom.letter)}
              {roster.kind === 'ready'
                ? ` · ${students.length} alumno${students.length === 1 ? '' : 's'}`
                : null}
            </p>
          </div>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={`/courses/${encodeURIComponent(classroom.id)}/heatmap`}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-semibold text-[var(--fg-1)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
          >
            Heatmap
            <ChevronRightIcon size={14} />
          </Link>
          <InviteStudentsButton courseId={classroom.id} />
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            aria-label="Archivar curso"
            className="inline-flex min-h-[40px] w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--fg-3)] transition-colors hover:border-[var(--error-fg)]/40 hover:bg-[var(--error-bg)] hover:text-[var(--error-fg)]"
          >
            <XIcon size={15} />
          </button>
        </div>
      </div>

      {/* Roster */}
      {expanded ? (
        <div className="border-t border-[var(--border)] px-5 pb-5 pt-4">
          {roster.kind === 'loading' ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-[var(--surface-2)]" />
              ))}
            </div>
          ) : roster.kind === 'error' ? (
            <EmptyState
              kind="error"
              title="No pudimos cargar los alumnos"
              body="Verifica que el backend está activo e intenta de nuevo."
            />
          ) : students.length === 0 ? (
            <EmptyState
              kind="no-data"
              title="Este curso no tiene alumnos todavía"
              body='Comparte el enlace de invitación con "Invitar alumnos".'
            />
          ) : (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                Alumnos ({students.length})
              </p>
              <div className="flex flex-col gap-1.5">
                {students.map((s) => {
                  const avgMastery =
                    s.topics.length === 0
                      ? null
                      : s.topics.reduce((acc, t) => acc + t.pKnown, 0) / s.topics.length;
                  const lvl = avgMastery !== null ? masteryLevel(avgMastery) : 'low';

                  return (
                    <Link
                      key={s.studentId}
                      href={`/courses/${encodeURIComponent(classroom.id)}/students/${encodeURIComponent(s.studentId)}`}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--surface)]"
                    >
                      <UsersIcon size={14} className="shrink-0 text-[var(--fg-3)]" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--fg-1)]">
                        {s.displayName}
                      </span>
                      <span className="tabular-nums text-xs text-[var(--fg-3)]">
                        {s.attempts.length} intentos
                      </span>
                      {avgMastery !== null ? (
                        <span
                          className={[
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
                            lvl === 'high'
                              ? 'bg-mastery-strong/15 text-mastery-strong'
                              : lvl === 'mid'
                                ? 'bg-mastery-medium/15 text-mastery-medium'
                                : 'bg-mastery-weak/15 text-mastery-weak',
                          ].join(' ')}
                        >
                          {Math.round(avgMastery * 100)}%
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>

    <Sheet
      open={deleteOpen}
      onClose={() => { if (!deleting) setDeleteOpen(false); }}
      title="Archivar curso"
      description={`¿Archivar "${classroom.name}"? Los alumnos no podrán unirse, pero el historial se conserva.`}
    >
      {deleting ? (
        <p className="py-2 text-sm text-[var(--fg-3)]">Archivando…</p>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="flex-1 rounded-xl bg-[var(--error-bg)] px-4 py-2 text-sm font-bold text-[var(--error-fg)] transition-colors hover:opacity-90"
          >
            Sí, archivar
          </button>
        </div>
      )}
    </Sheet>
  </>
  );
}

export function ClassroomsClient({ classrooms }: Props): JSX.Element {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {classrooms.length === 0 ? (
        <EmptyState
          kind="no-courses"
          title="Aún no tienes cursos"
          body='Crea el primero con "Nuevo curso" e invita a tus alumnos con un código.'
          className="mt-4"
        />
      ) : (
        classrooms.map((c) => <CourseCard key={c.id} classroom={c} />)
      )}
      <p className="mt-2 text-[11px] text-[var(--fg-3)]">
        {MASTERY_LABEL.high} ≥70% · {MASTERY_LABEL.mid} 40–70% · {MASTERY_LABEL.low} &lt;40%
      </p>
    </div>
  );
}
