import Link from 'next/link';
import { Card } from '@innova/ui';
import type { ParentChild } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';

// Server Component: the parent's children selector (C12). Mobile-first — parents
// arrive by phone. COPPA: no raw mastery numbers anywhere in the parent surface.
export const dynamic = 'force-dynamic';

function ChildCard({ c }: { c: ParentChild }): JSX.Element {
  return (
    <Link href={`/family/${c.studentId}`} className="block">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-900">{c.displayName}</p>
            <p className="mt-0.5 text-xs capitalize text-slate-500">{c.relationship}</p>
          </div>
          <span className="text-sky-500">→</span>
        </div>
      </Card>
    </Link>
  );
}

export default async function FamilyPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const children = await api.listChildren();

  return (
    <div className="mx-auto max-w-[560px]" data-testid="parent-children-root">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis hijos</h1>
      <p className="mt-1 text-sm text-slate-500">Sigue su progreso en matemáticas.</p>

      <div className="mt-6 flex flex-col gap-3">
        {!children.ok ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No pudimos cargar a tus hijos</p>
            <p className="mt-1 text-sm text-slate-500">
              {children.error.kind === 'http' && children.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Intenta de nuevo en un momento.'}
            </p>
          </Card>
        ) : children.data.length === 0 ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">Aún no tienes hijos vinculados</p>
            <p className="mt-1 text-sm text-slate-500">
              Pide al colegio el código de vinculación para ver su progreso.
            </p>
          </Card>
        ) : (
          children.data.map((c) => <ChildCard key={c.studentId} c={c} />)
        )}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
        <span className="text-lg">🔒</span>
        <p className="text-xs leading-5 text-slate-500">
          Los datos de tu hijo/a son privados. No compartimos información personal con terceros.
          Cumplimos COPPA y la Ley 21.180.
        </p>
      </div>
    </div>
  );
}
