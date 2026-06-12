import Link from 'next/link';
import { Card } from '@innova/ui';
import type { GuideListItem } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { GuideStatusBadge } from '@/components/guides/status';

// Server Component: the teacher's guides across their courses (GET /guides).
export const dynamic = 'force-dynamic';

function hrefFor(g: GuideListItem): string {
  if (g.status === 'REVIEW') return `/guides/${g.id}/review`;
  if (g.status === 'PUBLISHED') return `/guides/${g.id}/results`;
  return `/guides/${g.id}`;
}

function GuideRow({ g }: { g: GuideListItem }): JSX.Element {
  const due = g.dueAt ? new Date(g.dueAt).toLocaleDateString('es-CL') : null;
  return (
    <Link href={hrefFor(g)} className="block">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">{g.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {g.questionCount} pregunta{g.questionCount === 1 ? '' : 's'}
              {due ? ` · entrega ${due}` : ''}
              {g._count ? ` · ${g._count.submissions} entregas` : ''}
            </p>
          </div>
          <GuideStatusBadge status={g.status} />
        </div>
      </Card>
    </Link>
  );
}

export default async function GuidesPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const guides = await api.listGuides();

  return (
    <div className="mx-auto max-w-[760px]" data-testid="guides-root">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guías</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sube una guía en PDF, revisa la pauta y publícala para tu curso.
          </p>
        </div>
        <Link
          href="/guides/new"
          className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
        >
          + Nueva guía
        </Link>
      </div>

      <div className="mt-6">
        {!guides.ok ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No pudimos cargar tus guías</p>
            <p className="mt-1 text-sm text-slate-500">
              {guides.error.kind === 'http' && guides.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Hubo un problema de conexión. Intenta de nuevo en un momento.'}
            </p>
          </Card>
        ) : guides.data.items.length === 0 ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">Aún no tienes guías</p>
            <p className="mt-1 text-sm text-slate-500">
              Crea tu primera guía subiendo el PDF que ya usas en clases.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {guides.data.items.map((g) => (
              <GuideRow key={g.id} g={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
