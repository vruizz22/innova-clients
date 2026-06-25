import Link from 'next/link';
import { ChevronRightIcon, EmptyState, LockIcon } from '@innova/ui';
import type { ParentChild } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';

// Server Component: the parent's children selector (C12). Mobile-first — parents
// arrive by phone. COPPA: no raw mastery numbers anywhere in the parent surface.
export const dynamic = 'force-dynamic';

function childRoleLabel(relationship: string): string {
  const norm = relationship.toUpperCase();
  if (norm === 'PADRE' || norm === 'MADRE' || norm === 'TUTOR' || norm === 'TUTOR_LEGAL') {
    return 'Hijo/a';
  }
  return 'Estudiante';
}

function ChildCard({ c }: { c: ParentChild }): JSX.Element {
  return (
    <Link
      href={`/family/${c.studentId}`}
      className="sp-lift flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div>
        <p className="text-base font-bold text-[var(--fg-1)]">{c.displayName}</p>
        <p className="mt-0.5 text-xs text-[var(--fg-2)]">{childRoleLabel(c.relationship)}</p>
      </div>
      <ChevronRightIcon size={18} className="shrink-0 text-[var(--fg-3)]" />
    </Link>
  );
}

export default async function FamilyPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const children = await api.listChildren();

  return (
    <div className="mx-auto max-w-[560px]" data-testid="parent-children-root">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Mis hijos</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">Sigue su progreso en matemáticas.</p>

      <div className="sp-stagger mt-6 flex flex-col gap-3">
        {!children.ok ? (
          <EmptyState
            kind="error"
            title="No pudimos cargar a tus hijos"
            body={
              children.error.kind === 'http' && children.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Intenta de nuevo en un momento.'
            }
          />
        ) : children.data.length === 0 ? (
          <EmptyState
            kind="no-children"
            title="Aún no tienes hijos vinculados"
            body="Pide al colegio el código de vinculación para ver su progreso."
          />
        ) : (
          children.data.map((c) => <ChildCard key={c.studentId} c={c} />)
        )}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--surface-2)] p-4">
        <LockIcon size={18} className="mt-0.5 shrink-0 text-[var(--fg-3)]" />
        <p className="text-xs leading-5 text-[var(--fg-2)]">
          Los datos de tu hijo/a son privados. No compartimos información personal con terceros.
          Cumplimos COPPA y la Ley 21.180.
        </p>
      </div>
    </div>
  );
}
