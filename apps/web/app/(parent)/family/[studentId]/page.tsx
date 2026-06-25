import Link from 'next/link';
import { Card, EmptyState, LockIcon, StatCard } from '@innova/ui';
import type { ParentChildSummary, MasteryBand } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';

// Server Component: a child's COPPA-safe summary (C12) — qualitative mastery
// bands (never raw p_known), recent guides and soft alerts. No photos, no steps.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly studentId: string };
}

// Bar uses mastery-* tokens (DS palette, not alarm colors). Width is qualitative
// because COPPA prohibits showing raw P(L_n) to parents.
const BAND_UI: Record<MasteryBand, { label: string; bar: string; chip: string; pct: number }> = {
  high: {
    label: 'Logrado',
    bar: 'bg-mastery-strong',
    chip: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
    pct: 90,
  },
  mid: {
    label: 'En progreso',
    bar: 'bg-mastery-medium',
    chip: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
    pct: 55,
  },
  low: {
    label: 'Por reforzar',
    bar: 'bg-mastery-weak',
    chip: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
    pct: 25,
  },
};

const ALERT_TYPE_LABEL: Record<string, string> = {
  STUDENT_AT_RISK: 'Alumno necesita apoyo adicional',
  GUIDE_COMMON_ERROR: 'Error frecuente detectado en guía',
  LOW_MASTERY_DOMAIN: 'Dominio bajo en un área',
  GUIDE_NOT_SUBMITTED: 'Guía pendiente de entregar',
  MULTIPLE_FAILS: 'Varios intentos sin avance',
  INACTIVITY: 'Inactividad prolongada',
};
const SEVERITY_LABEL: Record<string, string> = {
  HIGH: 'Necesita apoyo',
  MED: 'A observar',
  LOW: 'Al tanto',
};

function UnitRow({ u }: { u: ParentChildSummary['units'][number] }): JSX.Element {
  const ui = BAND_UI[u.band];
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-bold text-[var(--fg-1)]">{u.name}</p>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className={`h-full ${ui.bar}`} style={{ width: `${ui.pct}%` }} />
          </div>
          <span
            className={`w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold ${ui.chip}`}
          >
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
        <EmptyState
          kind="error"
          title="No pudimos cargar el progreso"
          body={
            summary.error.kind === 'http' && summary.error.status === 403
              ? 'Este alumno no está vinculado a tu cuenta.'
              : 'Intenta de nuevo en un momento.'
          }
          action={
            <Link href="/family" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
              ← Mis hijos
            </Link>
          }
        />
      </div>
    );
  }

  const { student, units, recentGuides, alerts } = summary.data;
  const achieved = units.filter((u) => u.band === 'high').length;

  return (
    <div className="mx-auto max-w-[560px]" data-testid="parent-child-root">
      <Link
        href="/family"
        className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
      >
        ← Mis hijos
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg-1)]">
        Progreso de {student.displayName}
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Unidades logradas"
          value={achieved}
          of={units.length}
          valueClass="text-[var(--success-fg)]"
        />
        <StatCard
          label="Guías recientes"
          value={recentGuides.length}
          valueClass="text-[var(--primary)]"
        />
      </div>

      {alerts.length > 0 ? (
        <div className="mt-5 rounded-2xl bg-[var(--warning-bg)] p-4">
          <p className="text-sm font-bold text-[var(--warning-fg)]">Para acompañar en casa</p>
          <ul className="mt-2 flex flex-col gap-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-xs text-[var(--warning-fg)]">
                <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {SEVERITY_LABEL[a.severity] ?? 'Aviso'}
                </span>
                <span>{ALERT_TYPE_LABEL[a.alertType] ?? a.alertType}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mb-3 mt-8 text-sm font-bold text-[var(--fg-1)]">Progreso por unidad</h2>
      <div className="flex flex-col gap-2">
        {units.length === 0 ? (
          <EmptyState kind="no-data" title="Aún no hay datos de progreso." />
        ) : (
          units.map((u) => <UnitRow key={u.unitId} u={u} />)
        )}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-bold text-[var(--fg-1)]">Guías recientes</h2>
      <div className="flex flex-col gap-2">
        {recentGuides.length === 0 ? (
          <EmptyState kind="no-guides" title="No hay guías recientes." />
        ) : (
          recentGuides.map((g) => {
            const done = g.totalQuestions > 0 && g.gradedQuestions >= g.totalQuestions;
            return (
              <Card key={g.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-[var(--fg-1)]">
                    {g.title}
                  </p>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
                      done
                        ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
                        : 'bg-[var(--info-bg)] text-[var(--info-fg)]',
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
