'use client';

import { useCallback, useMemo, useState } from 'react';
import { AlertCard, EmptyState } from '@innova/ui';
import type { Alert } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';

export interface AlertsInboxProps {
  readonly initial: readonly Alert[];
}

type CardType = 'AT_RISK_SKILL' | 'COMMON_ERROR_DETECTED' | 'STUDENT_DROP';

/** Maps the backend's open-ended alertType onto the three card visuals. */
function toCardType(alertType: string): CardType {
  const t = alertType.toUpperCase();
  if (t.includes('DROP') || t.includes('INACTIV')) return 'STUDENT_DROP';
  if (t.includes('ERROR') || t.includes('COMMON')) return 'COMMON_ERROR_DETECTED';
  return 'AT_RISK_SKILL';
}

const TITLE: Record<CardType, string> = {
  AT_RISK_SKILL: 'Alumno en riesgo en un tema',
  COMMON_ERROR_DETECTED: 'Error común en el curso',
  STUDENT_DROP: 'Caída de actividad',
};

/** Pulls a human line out of the (untyped) alert payload, when present. */
function describe(alert: Alert): string | undefined {
  const p = alert.payload;
  if (p && typeof p === 'object') {
    const rec = p as Record<string, unknown>;
    for (const key of ['message', 'summary', 'description', 'detail']) {
      const v = rec[key];
      if (typeof v === 'string' && v.trim().length > 0) return v;
    }
  }
  return undefined;
}

/**
 * Teacher alerts inbox — surfaces the TeacherAlerts the hourly ai-engine detectors
 * write (at-risk skills, common errors, activity drops) and lets the teacher
 * resolve them. Optimistic: the card greys out immediately, reverting only if the
 * PATCH fails.
 */
export function AlertsInbox({ initial }: AlertsInboxProps): JSX.Element {
  const [resolved, setResolved] = useState<ReadonlySet<string>>(
    () => new Set(initial.filter((a) => a.resolvedAt).map((a) => a.id))
  );
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());

  const resolve = useCallback(async (id: string): Promise<void> => {
    setBusy((b) => new Set(b).add(id));
    setResolved((r) => new Set(r).add(id));
    const res = await getBrowserApi().resolveAlert(id);
    if (!res.ok) {
      // Revert on failure so the teacher can retry.
      setResolved((r) => {
        const next = new Set(r);
        next.delete(id);
        return next;
      });
    }
    setBusy((b) => {
      const next = new Set(b);
      next.delete(id);
      return next;
    });
  }, []);

  const openCount = useMemo(
    () => initial.filter((a) => !resolved.has(a.id)).length,
    [initial, resolved]
  );

  if (initial.length === 0) {
    return (
      <EmptyState
        kind="no-alerts"
        title="Sin alertas pendientes"
        body="Te avisaremos aquí cuando detectemos alumnos en riesgo o errores comunes."
      />
    );
  }

  return (
    <section aria-label="Alertas del curso">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--fg-1)]">Alertas</h2>
        <span className="text-xs font-semibold text-[var(--fg-3)]">
          {openCount} {openCount === 1 ? 'pendiente' : 'pendientes'}
        </span>
      </div>
      <div className="sp-stagger flex flex-col gap-2.5">
        {initial.map((a) => {
          const type = toCardType(a.alertType);
          const isResolved = resolved.has(a.id);
          const desc = describe(a);
          return (
            <AlertCard
              key={a.id}
              alertType={type}
              title={TITLE[type]}
              {...(desc ? { description: desc } : {})}
              createdAt={a.createdAt}
              resolved={isResolved}
              {...(isResolved || busy.has(a.id) ? {} : { onResolve: () => void resolve(a.id) })}
            />
          );
        })}
      </div>
    </section>
  );
}
