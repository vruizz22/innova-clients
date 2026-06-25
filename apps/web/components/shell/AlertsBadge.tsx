'use client';

import { useEffect, useState } from 'react';
import { getBrowserApi } from '@/lib/api.client';

export function AlertsBadge(): JSX.Element | null {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const api = getBrowserApi();
      const classrooms = await api.getMyClassrooms();
      if (!classrooms.ok || cancelled) return;
      const results = await Promise.all(
        classrooms.data.map((c) => api.getAlerts(c.id))
      );
      if (cancelled) return;
      const unresolved = results
        .filter((r) => r.ok)
        .flatMap((r) => (r.ok ? r.data : []))
        .filter((a) => a.resolvedAt == null)
        .length;
      setCount(unresolved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--error-bg)] px-1 text-[10px] font-bold tabular-nums text-[var(--error-fg)]">
      {count > 99 ? '99+' : count}
    </span>
  );
}
