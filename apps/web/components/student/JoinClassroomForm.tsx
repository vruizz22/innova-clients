'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { AlertTriangleIcon, CheckCircleIcon } from '@innova/ui';
import type { Classroom } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';

export interface JoinClassroomFormProps {
  /** Prefilled from the invite link (?code=…); empty when typed by hand. */
  readonly initialCode: string;
}

/** Student joins a course with an invite code (POST /classrooms/join). */
export function JoinClassroomForm({ initialCode }: JoinClassroomFormProps): JSX.Element {
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<Classroom | null>(null);

  const submit = useCallback(async (): Promise<void> => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const res = await getBrowserApi().joinClassroom({ code: code.trim() });
    setBusy(false);
    if (res.ok) setJoined(res.data);
    else setError('No pudimos unirte al curso. Revisa el código e intenta de nuevo.');
  }, [code]);

  if (joined) {
    return (
      <div className="sp-rise rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-card)]">
        <CheckCircleIcon size={44} className="mx-auto text-mint-500" />
        <p className="mt-3 text-lg font-black text-[var(--fg-1)]">¡Te uniste!</p>
        <p className="mt-1 text-sm text-[var(--fg-2)]">
          Ahora eres parte de <span className="font-semibold text-[var(--fg-1)]">{joined.name}</span>.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            href="/guides"
            className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Ver mis guías
          </Link>
          <Link
            href="/practice"
            className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)]"
          >
            Practicar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
      <h1 className="text-xl font-bold tracking-tight text-[var(--fg-1)]">Unirte a un curso</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Ingresa el código que te compartió tu profesor.
      </p>

      <label className="mt-4 flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
          Código de invitación
        </span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ej: A1B2C3"
          autoFocus
          autoCapitalize="characters"
          className="math rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-lg font-bold tracking-widest text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !busy) void submit();
          }}
        />
      </label>

      {error ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--error-fg)]">
          <AlertTriangleIcon size={16} /> {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || !code.trim()}
        className="mt-5 w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Uniéndote…' : 'Unirme al curso'}
      </button>
    </div>
  );
}
