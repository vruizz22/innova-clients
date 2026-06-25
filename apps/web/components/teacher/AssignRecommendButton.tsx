'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';

interface Props {
  readonly studentId: string;
  readonly exerciseId: string;
}

export function AssignRecommendButton({ studentId, exerciseId }: Props): JSX.Element {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const assign = useCallback(async (): Promise<void> => {
    setBusy(true);
    const res = await getBrowserApi().assignPractice({ studentId, itemIds: [exerciseId] });
    setBusy(false);
    if (res.ok) {
      toast.success('Práctica asignada al alumno');
      router.refresh();
    } else {
      toast.error('No pudimos asignar la práctica. Intenta de nuevo.');
    }
  }, [studentId, exerciseId, router]);

  return (
    <button
      type="button"
      onClick={() => void assign()}
      disabled={busy}
      className="shrink-0 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? 'Asignando…' : 'Asignar →'}
    </button>
  );
}
