import Link from 'next/link';
import { Card } from '@innova/ui';
import type { ParentChildSummary, MasteryBand } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';

// Server Component: a child's COPPA-safe summary (C12) — qualitative mastery
// bands (never raw p_known), recent guides and soft alerts. No photos, no steps.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly studentId: string };
}

const BAND_UI: Record<MasteryBand, { label: string; bar: string; chip: string; pct: number }> = {
  high: { label: 'Logrado', bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700', pct: 90 },
  mid: { label: 'En progreso', bar: 'bg-amber-400', chip: 'bg-amber-100 text-amber-800', pct: 55 },
  low: { label: 'Por reforzar', bar: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700', pct: 25 },
};

const SEVERITY_LABEL: Record<string, string> = {
  HIGH: 'Necesita apoyo',
  MED: 'A observar',
  LOW: 'Leve',
};

function UnitRow({ u }: { u: ParentChildSummary['units'][number] }): JSX.Element {
  const ui = BAND_UI[u.band];
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-bold text-slate-800">{u.name}</p>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${ui.bar}`} style={{ width: `${ui.pct}%` }} />
          </div>
          <span className={`w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold ${ui.chip}`}>
            {ui.label}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default async function ChildSummaryPage({ params }: PageProps): Promise<JSX.Element> {
  const studentId = decodeURIComponent(params.studentId);
  const api = getServerApi();
  const summary = await api.getChildSummary(studentId);

  if (!summary.ok) {
    return (
      <div className="mx-auto max-w-[560px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar el progreso</p>
          <p className="mt-1 text-sm text-slate-500">
            {summary.error.kind === 'http' && summary.error.status === 403
              ? 'Este alumno no está vinculado a tu cuenta.'
              : 'Intenta de nuevo en un momento.'}
          </p>
          <Link href="/family" className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Mis hijos
          </Link>
        </Card>
      </div>
    );
  }

  const { student, units, recentGuides, alerts } = summary.data;
  const achieved = units.filter((u) => u.band === 'high').length;

  return (
    <div className="mx-auto max-w-[560px]" data-testid="parent-child-root">
      <Link href="/family" className="text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Mis hijos
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        Progreso de {student.displayName}
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Unidades logradas
          </p>
          <p className="mt-1 text-3xl font-black text-emerald-600">
            {achieved} <span className="text-base text-slate-400">/ {units.length}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guías recientes</p>
          <p className="mt-1 text-3xl font-black text-sky-600">{recentGuides.length}</p>
        </Card>
      </div>

      {alerts.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">Para acompañar en casa</p>
          <ul className="mt-1 flex flex-col gap-1">
            {alerts.map((a) => (
              <li key={a.id} className="text-xs text-amber-700">
                • {SEVERITY_LABEL[a.severity] ?? 'Aviso'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mb-3 mt-8 text-sm font-bold text-slate-700">Progreso por unidad</h2>
      <div className="flex flex-col gap-2">
        {units.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">Aún no hay datos de progreso.</p>
          </Card>
        ) : (
          units.map((u) => <UnitRow key={u.unitId} u={u} />)
        )}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-bold text-slate-700">Guías recientes</h2>
      <div className="flex flex-col gap-2">
        {recentGuides.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">No hay guías recientes.</p>
          </Card>
        ) : (
          recentGuides.map((g) => {
            const done = g.totalQuestions > 0 && g.gradedQuestions >= g.totalQuestions;
            return (
              <Card key={g.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-800">{g.title}</p>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
                      done ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700',
                    ].join(' ')}
                  >
                    {g.gradedQuestions}/{g.totalQuestions}
                  </span>
                </div>
              </Card>
            );
          })
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
