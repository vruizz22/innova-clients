import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import type { TaxonomyDomain } from '@innova/api-client';

export const dynamic = 'force-dynamic';

function DomainCard({ domain }: { readonly domain: TaxonomyDomain }): JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold leading-snug text-[var(--fg-1)]">{domain.name}</p>
        <span className="shrink-0 rounded-full bg-[var(--info-bg)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--info-fg)]">
          {domain.code}
        </span>
      </div>
      {domain.subdomains.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {domain.subdomains.map((sub) => (
            <span
              key={sub.code}
              className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs text-[var(--fg-2)]"
            >
              {sub.name}
            </span>
          ))}
        </div>
      ) : null}
      <p className="text-[11px] text-[var(--fg-3)]">
        {domain.subdomains.length}{' '}
        {domain.subdomains.length === 1 ? 'subdominio' : 'subdominios'}
      </p>
    </div>
  );
}

export default async function SkillsPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const taxonomy = await api.listTaxonomy();

  if (!taxonomy.ok) {
    return (
      <EmptyState
        kind="error"
        title="No pudimos cargar el catálogo de habilidades"
        body="Verifica que el backend está activo e intenta de nuevo."
      />
    );
  }

  return (
    <div data-testid="skills-root">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Habilidades</h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Catálogo curricular K-12: {taxonomy.data.length} dominios con sus subdominios.
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--fg-2)]">
          {taxonomy.data.reduce((acc, d) => acc + d.subdomains.length, 0)} subdominios en total
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {taxonomy.data.map((domain) => (
          <DomainCard key={domain.code} domain={domain} />
        ))}
      </div>

      {taxonomy.data.length === 0 ? (
        <EmptyState
          kind="no-data"
          title="Sin dominios registrados"
          body="El catálogo de habilidades todavía no tiene datos. Contacta al administrador."
          className="mt-8"
        />
      ) : null}
    </div>
  );
}
