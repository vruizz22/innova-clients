'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dropzone, FileIcon } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';

export interface CourseOption {
  readonly id: string;
  readonly name: string;
}

export interface GuideUploaderProps {
  readonly courses: readonly CourseOption[];
}

const MAX_BYTES = 25 * 1024 * 1024; // 25MB (ADR-117 / C8)

type Phase =
  | { readonly kind: 'idle' }
  | { readonly kind: 'creating' }
  | { readonly kind: 'uploading' }
  | { readonly kind: 'ingesting' }
  | { readonly kind: 'error'; readonly message: string };

const FIELD =
  'w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-[var(--primary)]/20';

export function GuideUploader({ courses }: GuideUploaderProps): JSX.Element {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });

  const pickFile = useCallback((f: File | undefined): void => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setPhase({ kind: 'error', message: 'El archivo debe ser un PDF.' });
      return;
    }
    if (f.size > MAX_BYTES) {
      setPhase({ kind: 'error', message: 'El PDF supera el máximo de 25 MB.' });
      return;
    }
    setPhase({ kind: 'idle' });
    setFile(f);
  }, []);

  const busy =
    phase.kind === 'creating' || phase.kind === 'uploading' || phase.kind === 'ingesting';
  const canSubmit = courseId !== '' && title.trim().length > 0 && file !== null && !busy;

  const submit = useCallback(async (): Promise<void> => {
    if (!file || !canSubmit) return;
    const api = getBrowserApi();

    setPhase({ kind: 'creating' });
    const created = await api.createGuide({
      courseId,
      title: title.trim(),
      fileName: file.name,
      ...(dueAt ? { dueAt: new Date(dueAt).toISOString() } : {}),
    });
    if (!created.ok) {
      setPhase({ kind: 'error', message: 'No pudimos crear la guía. Intenta de nuevo.' });
      return;
    }

    setPhase({ kind: 'uploading' });
    const put = await fetch(created.data.presignedPutUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: file,
    }).catch(() => null);
    if (!put || !put.ok) {
      setPhase({ kind: 'error', message: 'Falló la subida del PDF. Revisa tu conexión.' });
      return;
    }

    setPhase({ kind: 'ingesting' });
    const ingest = await api.ingestGuide(created.data.guideId);
    if (!ingest.ok) {
      setPhase({ kind: 'error', message: 'Subimos el PDF pero no pudimos iniciar la lectura.' });
      return;
    }

    router.push(`/guides/${created.data.guideId}`);
    router.refresh();
  }, [canSubmit, courseId, dueAt, file, router, title]);

  const busyLabel =
    phase.kind === 'creating'
      ? 'Creando…'
      : phase.kind === 'uploading'
      ? 'Subiendo PDF…'
      : phase.kind === 'ingesting'
      ? 'Iniciando lectura…'
      : 'Subir y generar pauta';

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Curso</span>
        <select
          className={FIELD}
          value={courseId}
          disabled={busy}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Título
        </span>
        <input
          className={FIELD}
          value={title}
          disabled={busy}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Guía 4 — Fracciones"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Fecha de entrega (opcional)
        </span>
        <input
          type="date"
          className={FIELD}
          value={dueAt}
          disabled={busy}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </label>

      <Dropzone accept="application/pdf" disabled={busy} onFiles={(files) => pickFile(files[0])}>
        <FileIcon size={32} className="text-brand" />
        <span className="text-sm font-bold text-ink">
          {file ? file.name : 'Arrastra el PDF aquí o haz clic para elegir'}
        </span>
        <span className="text-xs text-ink-muted">PDF · máximo 25 MB · hasta 40 páginas</span>
      </Dropzone>

      {phase.kind === 'error' ? (
        <p
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: 'var(--error-bg)', color: 'var(--error-fg)' }}
        >
          {phase.message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!canSubmit}
        className="rounded-xl bg-brand px-5 py-3 text-base font-bold text-brand-fg transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? busyLabel : 'Subir y generar pauta'}
      </button>
    </div>
  );
}
