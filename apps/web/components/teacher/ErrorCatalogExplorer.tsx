'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchIcon, XIcon, ChevronRightIcon, CheckIcon, PlusIcon } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import type { CatalogError } from '@innova/api-client';

interface Props {
  readonly onSelect?: (error: CatalogError) => void;
  /** Multi-select mode: called when user toggles an error on/off. */
  readonly onToggle?: (error: CatalogError) => void;
  /** Codes already selected (used to render checkmarks in multi-select mode). */
  readonly selectedCodes?: readonly string[];
  readonly className?: string;
}

function groupByDomain(errors: readonly CatalogError[]): Map<string, CatalogError[]> {
  const map = new Map<string, CatalogError[]>();
  for (const e of errors) {
    const key = e.domainCode ?? 'SIN_DOMINIO';
    const existing = map.get(key);
    if (existing) {
      existing.push(e);
    } else {
      map.set(key, [e]);
    }
  }
  return map;
}

/**
 * Teacher-facing catalog explorer. Searches the live backend ACTIVE catalog
 * (2607+ errors in es-CL), groups results by domain, and shows a detail panel
 * for the selected entry. Reusable in: standalone /error-search page, the
 * attempt-detail override drawer, and assign-practice skill picker.
 */
export function ErrorCatalogExplorer({ onSelect, onToggle, selectedCodes, className }: Props): JSX.Element {
  const isMultiSelect = !!onToggle;
  const [q, setQ] = useState('');
  const [results, setResults] = useState<readonly CatalogError[]>([]);
  const [selected, setSelected] = useState<CatalogError | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  const search = useCallback((query: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(() => {
      const id = ++reqId.current;
      void getBrowserApi()
        .searchCatalogErrors({ q: query, limit: 40 })
        .then((res) => {
          if (reqId.current === id) {
            setResults(res.ok ? res.data : []);
            setLoading(false);
          }
        });
    }, 250);
  }, []);

  useEffect(() => {
    search(q);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, search]);

  const grouped = groupByDomain(results);

  function handleSelect(e: CatalogError): void {
    setSelected(e);
    onSelect?.(e);
  }

  return (
    <div className={['flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      {/* Search input */}
      <div className="relative">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-3)]"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelected(null);
          }}
          placeholder="Buscar en el catálogo de errores… (ej. «resta», «fracción», «signo»)"
          className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-10 text-sm text-[var(--fg-1)] placeholder:text-[var(--fg-3)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15"
          aria-label="Buscar error en el catálogo"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setResults([]);
              setSelected(null);
            }}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--fg-3)] hover:bg-[var(--surface-2)] hover:text-[var(--fg-1)]"
          >
            <XIcon size={14} />
          </button>
        ) : null}
      </div>

      {/* Empty prompt */}
      {!q.trim() ? (
        <p className="text-sm text-[var(--fg-3)]">
          El catálogo contiene 2 607 errores clasificados por dominio y subdominio en español.
          Escribe para buscar.
        </p>
      ) : null}

      {/* Loading skeletons */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--surface-2)]" />
          ))}
        </div>
      ) : null}

      {/* No results */}
      {!loading && q.trim() && results.length === 0 ? (
        <p className="text-sm text-[var(--fg-3)]">Sin resultados para «{q}».</p>
      ) : null}

      {/* Results + detail */}
      {!loading && results.length > 0 ? (
        <div className="flex gap-4">
          {/* Results list grouped by domain */}
          <div
            className="min-w-0 flex-1 overflow-y-auto"
            style={{ maxHeight: '480px' }}
            role="listbox"
            aria-label="Resultados del catálogo"
          >
            {Array.from(grouped.entries()).map(([domain, items]) => (
              <div key={domain} className="mb-4">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--fg-3)]">
                  {domain}
                </p>
                <div className="flex flex-col gap-1">
                  {items.map((e) => {
                    const isSelected = isMultiSelect
                      ? (selectedCodes?.includes(e.code) ?? false)
                      : selected?.code === e.code;
                    return (
                      <button
                        key={e.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => isMultiSelect ? onToggle(e) : handleSelect(e)}
                        className={[
                          'group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-[var(--dur-fast)]',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-2)]',
                        ].join(' ')}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--fg-1)]">
                            {e.name ?? e.code}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--fg-3)]">{e.code}</span>
                        </span>
                        {isMultiSelect ? (
                          isSelected ? (
                            <CheckIcon size={14} className="shrink-0 text-[var(--primary)]" />
                          ) : (
                            <PlusIcon size={14} className="shrink-0 text-[var(--fg-3)] group-hover:text-[var(--fg-2)]" />
                          )
                        ) : (
                          <ChevronRightIcon
                            size={14}
                            className={[
                              'shrink-0 transition-colors',
                              isSelected ? 'text-[var(--primary)]' : 'text-[var(--fg-3)] group-hover:text-[var(--fg-2)]',
                            ].join(' ')}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel — hidden in multi-select mode */}
          {!isMultiSelect ? <div className="w-52 shrink-0 self-start">
            {selected ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
                <p className="text-sm font-bold text-[var(--fg-1)]">{selected.name ?? selected.code}</p>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--fg-3)]">{selected.code}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selected.domainCode ? (
                    <span className="rounded-full bg-[var(--info-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--info-fg)]">
                      {selected.domainCode}
                    </span>
                  ) : null}
                  {selected.subdomainCode ? (
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--fg-2)]">
                      {selected.subdomainCode}
                    </span>
                  ) : null}
                </div>
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(selected)}
                    className="mt-4 w-full rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
                  >
                    Usar este error
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-4">
                <p className="text-xs text-[var(--fg-3)]">
                  Selecciona un error para ver su detalle.
                </p>
              </div>
            )}
          </div> : null}
        </div>
      ) : null}
    </div>
  );
}
