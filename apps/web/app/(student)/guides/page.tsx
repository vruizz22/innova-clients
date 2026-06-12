import Link from 'next/link';
import { Card } from '@innova/ui';
import type { StudentGuideListItem } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';

// Server Component: the student's PUBLISHED guides with per-guide progress.
export const dynamic = 'force-dynamic';

function GuideRow({ g }: { g: StudentGuideListItem }): JSX.Element {
  const due = g.dueAt ? new Date(g.dueAt).toLocaleDateString('es-CL') : null;
  const done = g.totalQuestions > 0 && g.gradedQuestions >= g.totalQuestions;
  return (
    <Link href={`/guides/${g.id}`} className="block">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">{g.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {g.gradedQuestions} de {g.totalQuestions} corregidas
              {due ? ` · entrega ${due}` : ''}
            </p>
          </div>
          <span
            className={[
              'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
              done ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700',
            ].join(' ')}
          >
            {done ? 'Completa' : 'Pendiente'}
          </span>
        </div>
      </Card>
    </Link>
  );
}

export default async function StudentGuidesPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const guides = await api.listStudentGuides();

  return (
    <div className="mx-auto max-w-[640px]" data-testid="student-guides-root">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis guías</h1>
      <p className="mt-1 text-sm text-slate-500">Responde cada pregunta con una foto de tu desarrollo.</p>

      <div className="mt-6">
        {!guides.ok ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No pudimos cargar tus guías</p>
            <p className="mt-1 text-sm text-slate-500">
              {guides.error.kind === 'http' && guides.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Intenta de nuevo en un momento.'}
            </p>
          </Card>
        ) : guides.data.length === 0 ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No tienes guías por ahora 🎉</p>
            <p className="mt-1 text-sm text-slate-500">
              Cuando tu profe publique una guía, aparecerá aquí.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {guides.data.map((g) => (
              <GuideRow key={g.id} g={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
