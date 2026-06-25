'use client';

import { useState, useCallback } from 'react';
import { EmptyState } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import { AlertsInbox } from './AlertsInbox';
import type { Alert } from '@innova/api-client';

interface CourseOption {
  readonly id: string;
  readonly name: string;
}

interface Props {
  readonly courses: readonly CourseOption[];
}

type State =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly alerts: readonly Alert[] }
  | { readonly kind: 'error' };

export function AlertsPageClient({ courses }: Props): JSX.Element {
  const [courseId, setCourseId] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const loadAlerts = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      setState({ kind: 'idle' });
      return;
    }
    setState({ kind: 'loading' });
    const res = await getBrowserApi().getAlerts(id);
    setState(res.ok ? { kind: 'ready', alerts: res.data } : { kind: 'error' });
  }, []);

  return (
    <div className="mt-6">
      <div className="mb-6">
        <label
          htmlFor="alert-course-select"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]"
        >
          Curso
        </label>
        <select
          id="alert-course-select"
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            void loadAlerts(e.target.value);
          }}
          className="h-10 w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15"
        >
          <option value="">— Elige un curso —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {state.kind === 'idle' ? (
        <p className="text-sm text-[var(--fg-3)]">Elige un curso para ver sus alertas pendientes.</p>
      ) : state.kind === 'loading' ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--surface-2)]" />
          ))}
        </div>
      ) : state.kind === 'error' ? (
        <EmptyState
          kind="error"
          title="No pudimos cargar las alertas"
          body="Verifica que el backend está activo e intenta de nuevo."
        />
      ) : (
        <AlertsInbox initial={state.alerts as Alert[]} />
      )}
    </div>
  );
}
