'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangleIcon, PlusIcon, Sheet, toast } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
  value: n,
  label:
    n <= 8
      ? `${n}° básico`
      : `${(['I', 'II', 'III', 'IV'] as const)[n - 9] ?? `${n - 8}°`} medio`,
}));

const LETTER_OPTIONS = ['A', 'B', 'C', 'D'] as const;

export function CreateCourseButton(): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [gradeLevel, setGradeLevel] = useState(4);
  const [letter, setLetter] = useState<string>('A');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = (): void => {
    if (!busy) setOpen(false);
  };

  const submit = useCallback(async (): Promise<void> => {
    setBusy(true);
    setError(null);
    const res = await getBrowserApi().createClassroom({ gradeLevel, letter });
    setBusy(false);
    if (res.ok) {
      toast.success('Curso creado');
      setOpen(false);
      router.refresh();
    } else {
      setError('No pudimos crear el curso. Intenta de nuevo.');
    }
  }, [gradeLevel, letter, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
      >
        <PlusIcon size={16} /> Nuevo curso
      </button>

      <Sheet
        open={open}
        onClose={close}
        title="Crear curso"
        description="Elige el nivel y la letra. El nombre se genera automáticamente."
      >
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
              Nivel
            </span>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              autoFocus
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-24 flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
              Letra
            </span>
            <select
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
            >
              {LETTER_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--error-fg)]">
            <AlertTriangleIcon size={16} /> {error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Creando…' : 'Crear curso'}
          </button>
        </div>
      </Sheet>
    </>
  );
}
