'use client';

import { useRef, useState } from 'react';
import { getBrowserApi } from '@/lib/api.client';
import type {
  AdminErrorTag,
  AdminErrorTagList,
  AdminErrorTagSource,
  AdminErrorTagStatus,
  ListErrorTagsParams,
} from '@innova/api-client';

const STATUSES: readonly AdminErrorTagStatus[] = ['ACTIVE', 'DRAFT', 'DEPRECATED'];
const SOURCES: readonly AdminErrorTagSource[] = ['CURATED', 'LLM_GENERATED', 'FIELD_REPORTED'];
const PAGE_SIZE = 50;

const STATUS_STYLES: Record<AdminErrorTagStatus, string> = {
  ACTIVE: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
  DRAFT: 'bg-[var(--info-bg)] text-[var(--info-fg)]',
  DEPRECATED: 'bg-[var(--surface-2)] text-[var(--fg-2)]',
};

interface Filters {
  readonly status: AdminErrorTagStatus | '';
  readonly domainCode: string;
  readonly source: AdminErrorTagSource | '';
  readonly q: string;
}

const EMPTY_FILTERS: Filters = { status: '', domainCode: '', source: '', q: '' };

interface StatusCounts {
  active: number;
  draft: number;
  deprecated: number;
}

const STATUS_TO_KEY: Record<AdminErrorTagStatus, keyof StatusCounts> = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  DEPRECATED: 'deprecated',
};

interface Props {
  readonly initial: AdminErrorTagList;
}

/**
 * Live error-tag catalog browser (ADMIN). The first page is fetched on the
 * server and handed in via `initial`; filters, pagination and promote/deprecate
 * mutations hit the backend on demand (the catalog is the source of truth and
 * keeps growing, so we never load the whole table).
 */
export function AdminErrorCatalogClient({ initial }: Props): JSX.Element {
  const api = getBrowserApi();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [items, setItems] = useState<AdminErrorTag[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [total, setTotal] = useState(initial.total);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>(initial.statusCounts);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domains = initial.domains;

  function toParams(f: Filters, cursor: string | null): ListErrorTagsParams {
    return {
      ...(f.status ? { status: f.status } : {}),
      ...(f.domainCode ? { domainCode: f.domainCode } : {}),
      ...(f.source ? { source: f.source } : {}),
      ...(f.q.trim() ? { q: f.q.trim() } : {}),
      ...(cursor ? { cursor } : {}),
      limit: PAGE_SIZE,
    };
  }

  async function runFetch(f: Filters, cursor: string | null): Promise<void> {
    setLoading(true);
    setError(null);
    const res = await api.listErrorTags(toParams(f, cursor));
    setLoading(false);
    if (!res.ok) {
      setError('No se pudo cargar el catálogo. Reintenta.');
      return;
    }
    setItems((prev) => (cursor ? [...prev, ...res.data.items] : res.data.items));
    setNextCursor(res.data.nextCursor);
    setTotal(res.data.total);
    setStatusCounts(res.data.statusCounts);
  }

  function applyFilter(patch: Partial<Filters>): void {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (patch.q !== undefined) {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void runFetch(next, null), 300);
      return;
    }
    void runFetch(next, null);
  }

  async function setStatusOf(code: string, nextStatus: AdminErrorTagStatus): Promise<void> {
    const current = items.find((t) => t.code === code);
    const res = await api.updateErrorTagStatus(code, nextStatus);
    if (!res.ok) {
      setError(`No se pudo actualizar ${code}.`);
      return;
    }
    setItems((prev) => {
      // If a status filter is active, a re-tagged row no longer belongs here.
      if (filters.status && filters.status !== nextStatus) {
        return prev.filter((t) => t.code !== code);
      }
      return prev.map((t) => (t.code === code ? res.data : t));
    });
    if (current && current.status !== nextStatus) {
      setStatusCounts((prev) => ({
        ...prev,
        [STATUS_TO_KEY[current.status]]: Math.max(0, prev[STATUS_TO_KEY[current.status]] - 1),
        [STATUS_TO_KEY[nextStatus]]: prev[STATUS_TO_KEY[nextStatus]] + 1,
      }));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Catálogo de errores</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        {statusCounts.active} activos · {statusCounts.draft} borradores · {statusCounts.deprecated}{' '}
        obsoletos
        <span className="text-[var(--fg-3)]"> · catálogo en vivo</span>
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.q}
          onChange={(e) => applyFilter({ q: e.target.value })}
          placeholder="Buscar por código o nombre…"
          className="h-10 min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
        <select
          value={filters.domainCode}
          onChange={(e) => applyFilter({ domainCode: e.target.value })}
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)]"
        >
          <option value="">Todos los dominios</option>
          {domains.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name} ({d.count})
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => applyFilter({ status: e.target.value as AdminErrorTagStatus | '' })}
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)]"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.source}
          onChange={(e) => applyFilter({ source: e.target.value as AdminErrorTagSource | '' })}
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg-1)]"
        >
          <option value="">Todas las fuentes</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--fg-2)]">
              <th className="px-4 py-3">Error</th>
              <th className="px-4 py-3">Dominio</th>
              <th className="px-4 py-3">Grados</th>
              <th className="px-4 py-3">Fuente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr
                key={t.code}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--fg-1)]">{t.name || t.code}</p>
                  <p className="mt-1 font-mono text-[11px] text-[var(--fg-3)]">{t.code}</p>
                </td>
                <td className="px-4 py-3 text-[var(--fg-2)]">
                  {t.domainName ?? t.domainCode ?? '—'}
                </td>
                <td className="px-4 py-3 text-[var(--fg-2)]">
                  {t.applicableGrades.join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-[var(--fg-2)]">{t.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      STATUS_STYLES[t.status]
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {t.status === 'DRAFT' ? (
                    <button
                      onClick={() => void setStatusOf(t.code, 'ACTIVE')}
                      className="text-xs font-semibold text-[var(--success-fg)] hover:underline"
                    >
                      Aprobar
                    </button>
                  ) : t.status === 'ACTIVE' ? (
                    <button
                      onClick={() => void setStatusOf(t.code, 'DEPRECATED')}
                      className="text-xs font-semibold text-[var(--fg-2)] hover:underline"
                    >
                      Deprecar
                    </button>
                  ) : (
                    <button
                      onClick={() => void setStatusOf(t.code, 'ACTIVE')}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline"
                    >
                      Reactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-[var(--fg-3)]">
          Mostrando {items.length} de {total}
        </p>
        {nextCursor ? (
          <button
            onClick={() => void runFetch(filters, nextCursor)}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg-1)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Cargar más'}
          </button>
        ) : null}
      </div>

      {items.length === 0 && !loading ? (
        <p className="mt-10 text-center text-sm text-[var(--fg-3)]">Sin resultados.</p>
      ) : null}
    </div>
  );
}
