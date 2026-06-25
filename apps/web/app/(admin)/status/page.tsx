import { Card, EmptyState, StatCard } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import type { AdminStatus, QueueStatus } from '@innova/api-client';

export const dynamic = 'force-dynamic';

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, live }: { title: string; live?: boolean }): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-bold text-[var(--fg-1)]">{title}</h2>
      {live ? (
        <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--success-fg)]">
          en vivo
        </span>
      ) : (
        <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-3)]">
          pendiente EMF
        </span>
      )}
    </div>
  );
}

// ─── queues ───────────────────────────────────────────────────────────────────

const QUEUE_LABELS: Record<string, string> = {
  'guide-ingest': 'Ingestión de guías',
  'attempt-reprocess': 'Reproceso de intentos',
  'llm-classify': 'Clasificación LLM',
  'hourly-alerts': 'Alertas hourly (A9)',
};

function QueueCard({ name, q }: { name: string; q: QueueStatus }): JSX.Element {
  const label = QUEUE_LABELS[name] ?? name;
  const depthColor =
    q.depth > 100
      ? 'text-[var(--error-fg)]'
      : q.depth > 20
        ? 'text-[var(--warning-fg)]'
        : 'text-[var(--success-fg)]';

  return (
    <Card>
      <p className="text-xs font-semibold text-[var(--fg-2)]">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className={['text-lg font-black', depthColor].join(' ')}>
            {q.depth === -1 ? '—' : q.depth}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--fg-3)]">En cola</p>
        </div>
        <div>
          <p className="text-lg font-black text-[var(--fg-1)]">
            {q.dlqDepth === -1 ? '—' : q.dlqDepth}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--fg-3)]">DLQ</p>
        </div>
        <div>
          <p className="text-lg font-black text-[var(--fg-1)]">{q.processedLastHour}</p>
          <p className="mt-0.5 text-[10px] text-[var(--fg-3)]">Última hora</p>
        </div>
      </div>
    </Card>
  );
}

function QueuesSection({ status }: { status: AdminStatus }): JSX.Element {
  const queueOrder = ['guide-ingest', 'attempt-reprocess', 'llm-classify', 'hourly-alerts'];

  return (
    <section>
      <SectionHeader title="Colas SQS" live />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {queueOrder.map((key) => {
          const q = status.queues[key];
          if (!q) return null;
          return <QueueCard key={key} name={key} q={q} />;
        })}
      </div>
    </section>
  );
}

// ─── pipeline ─────────────────────────────────────────────────────────────────

function PipelineSection({ status }: { status: AdminStatus }): JSX.Element {
  const { pipeline } = status;
  return (
    <section>
      <SectionHeader title="Pipeline (última hora)" live />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Intentos" value={pipeline.attemptsLastHour} />
        <StatCard label="Envíos foto" value={pipeline.submissionsLastHour} />
        <StatCard label="Clasificados LLM" value={pipeline.classifiedLastHour} />
        <StatCard
          label="Guías pendientes"
          value={pipeline.pendingGuides}
          valueClass={pipeline.pendingGuides > 5 ? 'text-[var(--warning-fg)]' : undefined}
        />
      </div>
    </section>
  );
}

// ─── cost ─────────────────────────────────────────────────────────────────────

function CostSection({ status }: { status: AdminStatus }): JSX.Element {
  const { cost } = status;
  const hasCostData = cost.byModel.length > 0;

  return (
    <section>
      <SectionHeader title="Costo y tokens (EMF A9.4)" live={hasCostData} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard
          label="Gasto hoy (USD)"
          value={cost.todayUsd === 0 && !hasCostData ? undefined : cost.todayUsd}
          pending={!hasCostData}
        />
        <StatCard
          label="Gasto mes (USD)"
          value={cost.monthUsd === 0 && !hasCostData ? undefined : cost.monthUsd}
          pending={!hasCostData}
        />
      </div>

      {hasCostData ? (
        <div className="mt-3 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Modelo', 'Llamadas', 'Tokens entrada', 'Tokens salida', 'Costo USD'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[var(--fg-2)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cost.byModel.map((row) => (
                <tr key={row.model} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-mono text-xs text-[var(--fg-1)]">{row.model}</td>
                  <td className="px-3 py-2 text-sm text-[var(--fg-1)]">{row.calls}</td>
                  <td className="px-3 py-2 text-sm text-[var(--fg-1)]">{row.inputTokens.toLocaleString()}</td>
                  <td className="px-3 py-2 text-sm text-[var(--fg-1)]">{row.outputTokens.toLocaleString()}</td>
                  <td className="px-3 py-2 text-sm font-bold text-[var(--fg-1)]">
                    ${row.costUsd.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--fg-3)]">
          Métricas de costo disponibles tras desplegar el ai-engine con A9.4 EMF activo.
        </p>
      )}
    </section>
  );
}

// ─── killswitches ─────────────────────────────────────────────────────────────

const KILLSWITCH_LABELS: Record<string, string> = {
  graderEnabled: 'Corrección de envíos (submission grader A8)',
  classifierEnabled: 'Clasificación de errores (LLM classifier)',
  hourlyAlertsEnabled: 'Alertas horarias (A9 cron)',
  solutionGeneratorEnabled: 'Generación de pauta (solution generator A7)',
};

const KS_ORDER = [
  'graderEnabled',
  'classifierEnabled',
  'hourlyAlertsEnabled',
  'solutionGeneratorEnabled',
] as const;

function KillswitchSection({ status }: { status: AdminStatus }): JSX.Element {
  return (
    <section>
      <SectionHeader title="Killswitches (SSM)" live />
      <div className="mt-3 flex flex-col gap-2">
        {KS_ORDER.map((key) => {
          const enabled = status.killswitches[key] ?? false;
          return (
            <Card key={key}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--fg-1)]">{KILLSWITCH_LABELS[key] ?? key}</p>
                <span
                  className={[
                    'rounded-full px-3 py-0.5 text-xs font-bold',
                    enabled
                      ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
                      : 'bg-[var(--error-bg)] text-[var(--error-fg)]',
                  ].join(' ')}
                >
                  {enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--fg-3)]">
        Los killswitches leen SSM en prod. Todos ON en local (SSM no disponible en desarrollo).
      </p>
    </section>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function AdminStatusPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const result = await api.getAdminStatus();

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-[860px]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">
          Estado del sistema
        </h1>
        <EmptyState
          kind="error"
          title="No se pudo conectar con el backend"
          body="Verifica que el backend está desplegado y el endpoint GET /admin/status está disponible."
          className="mt-6"
        />
      </div>
    );
  }

  const status = result.data;

  return (
    <div className="mx-auto max-w-[860px]" data-testid="admin-status-root">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">
            Estado del sistema
          </h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Salud de colas, costo de inferencia y killswitches del ai-engine.
          </p>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-bold text-[var(--success-fg)]">
          En vivo
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-10">
        <QueuesSection status={status} />
        <PipelineSection status={status} />
        <CostSection status={status} />
        <KillswitchSection status={status} />
      </div>
    </div>
  );
}
