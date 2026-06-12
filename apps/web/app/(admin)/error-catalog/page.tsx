'use client';

import { useMemo, useState } from 'react';
import { ErrorTagChip } from '@innova/ui';
import {
  DOMAINS,
  ERROR_TAGS,
  getDomain,
  type CatalogSource,
  type CatalogStatus,
  type ErrorTag,
} from '@innova/error-catalog';

const STATUSES: CatalogStatus[] = ['ACTIVE', 'DRAFT', 'DEPRECATED'];
const SOURCES: CatalogSource[] = ['CURATED', 'LLM_GENERATED', 'FIELD_REPORTED'];

const STATUS_STYLES: Record<CatalogStatus, string> = {
  ACTIVE: 'bg-mint-100 text-mint-700',
  DRAFT: 'bg-sky-100 text-sky-800',
  DEPRECATED: 'bg-slate-100 text-slate-500',
};

export default function AdminErrorCatalogPage(): JSX.Element {
  const [tags, setTags] = useState<ErrorTag[]>([...ERROR_TAGS]);
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<CatalogStatus | ''>('');
  const [source, setSource] = useState<CatalogSource | ''>('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags.filter(
      (t) =>
        (!domain || t.domain_code === domain) &&
        (!status || t.status === status) &&
        (!source || t.source === source) &&
        (!q || t.code.toLowerCase().includes(q) || t.name_es.toLowerCase().includes(q)),
    );
  }, [tags, domain, status, source, query]);

  function setStatusOf(code: string, next: CatalogStatus): void {
    setTags((prev) => prev.map((t) => (t.code === code ? { ...t, status: next } : t)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catálogo de errores</h1>
      <p className="mt-1 text-sm text-slate-500">
        {tags.filter((t) => t.status === 'ACTIVE').length} activos ·{' '}
        {tags.filter((t) => t.status === 'DRAFT').length} borradores ·{' '}
        {tags.filter((t) => t.status === 'DEPRECATED').length} obsoletos
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por código o nombre…"
          className="h-10 min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
        <select value={domain} onChange={(e) => setDomain(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
          <option value="">Todos los dominios</option>
          {DOMAINS.map((d) => (
            <option key={d.code} value={d.code}>{d.name_es}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as CatalogStatus | '')} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value as CatalogSource | '')} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
          <option value="">Todas las fuentes</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Error</th>
              <th className="px-4 py-3">Dominio</th>
              <th className="px-4 py-3">Grados</th>
              <th className="px-4 py-3">Fuente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.code} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <ErrorTagChip code={t.code} tag={t} />
                  <p className="mt-1 font-mono text-[11px] text-slate-400">{t.code}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{getDomain(t.domain_code)?.name_es ?? t.domain_code}</td>
                <td className="px-4 py-3 text-slate-600">{t.applicable_grades.join(', ')}</td>
                <td className="px-4 py-3 text-slate-600">{t.source}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {t.status === 'DRAFT' ? (
                    <button onClick={() => setStatusOf(t.code, 'ACTIVE')} className="text-xs font-semibold text-mint-700 hover:underline">
                      Aprobar
                    </button>
                  ) : t.status === 'ACTIVE' ? (
                    <button onClick={() => setStatusOf(t.code, 'DEPRECATED')} className="text-xs font-semibold text-slate-500 hover:underline">
                      Deprecar
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">Sin resultados.</p>
      ) : null}
    </div>
  );
}
