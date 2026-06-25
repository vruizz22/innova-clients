'use client';

import { useCallback, useState } from 'react';
import { AlertTriangleIcon, Sheet, UsersIcon, toast } from '@innova/ui';
import type { ClassroomInvite } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';

export interface InviteStudentsButtonProps {
  readonly courseId: string;
}

export function InviteStudentsButton({ courseId }: InviteStudentsButtonProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState<ClassroomInvite | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (): Promise<void> => {
    setOpen(true);
    setBusy(true);
    setError(null);
    const res = await getBrowserApi().createClassroomInvite(courseId);
    setBusy(false);
    if (res.ok) setInvite(res.data);
    else setError('No pudimos generar la invitación. Intenta de nuevo.');
  }, [courseId]);

  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Enlace de invitación copiado');
    } catch {
      toast.error('No pudimos copiar. Copia el código manualmente.');
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => void generate()}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--fg-1)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--info-bg)]"
      >
        <UsersIcon size={16} className="text-[var(--primary)]" /> Invitar alumnos
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Invitar alumnos"
        description="Comparte este código (o el enlace) con tus alumnos para que se unan al curso."
      >
        {busy ? (
          <p className="py-4 text-sm text-[var(--fg-3)]">Generando invitación…</p>
        ) : error ? (
          <p className="inline-flex items-center gap-1.5 py-4 text-sm font-medium text-[var(--error-fg)]">
            <AlertTriangleIcon size={16} /> {error}
          </p>
        ) : invite ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
                Código de acceso
              </span>
              <p className="math mt-1 text-2xl font-black tracking-widest text-[var(--fg-1)]">
                {invite.code}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void copy(invite.code)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fg-1)] transition-colors hover:bg-[var(--surface-2)]"
              >
                Copiar código
              </button>
              {invite.url ? (
                <button
                  type="button"
                  onClick={() => void copy(invite.url!)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
                >
                  Copiar enlace
                </button>
              ) : null}
            </div>
            {invite.url ? (
              <p className="break-all text-xs text-[var(--fg-3)]">{invite.url}</p>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
