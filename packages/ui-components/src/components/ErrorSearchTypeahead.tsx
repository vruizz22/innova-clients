'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  searchErrorTags,
  formatHumanName,
  type CatalogStatus,
  type ErrorTag,
} from '@innova/error-catalog';

interface ErrorSearchTypeaheadProps {
  onSelect: (tag: ErrorTag) => void;
  placeholder?: string;
  limit?: number;
  status?: CatalogStatus;
  domainCode?: string;
  className?: string;
  /**
   * Async catalog search (e.g. the live backend catalog of 2.6k+ ACTIVE tags).
   * When omitted, the component searches the bundled seed — fine for offline or
   * small surfaces, but only covers a handful of errors.
   */
  searchFn?: (query: string) => Promise<ErrorTag[]>;
}

/** Fuzzy typeahead over the error catalog — attempt review "reportar otro error" (v8 C4). */
export function ErrorSearchTypeahead({
  onSelect,
  placeholder = 'Buscar error por nombre o código…',
  limit = 8,
  status,
  domainCode,
  className = '',
  searchFn,
}: ErrorSearchTypeaheadProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState<ErrorTag[]>([]);

  // Local (bundled-seed) search — used only when no async searchFn is provided.
  const local = useMemo(
    () => (searchFn ? [] : searchErrorTags(query, { limit, status, domainCode })),
    [searchFn, query, limit, status, domainCode]
  );

  // Async (live-backend) search — debounced, with a stale-response guard so a
  // slow earlier request can never overwrite a newer one.
  const reqId = useRef(0);
  useEffect(() => {
    if (!searchFn) return;
    const id = ++reqId.current;
    const handle = setTimeout(() => {
      void searchFn(query).then((tags) => {
        if (reqId.current === id) setRemote(tags.slice(0, limit));
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [searchFn, query, limit]);

  const results = searchFn ? remote : local;

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg-1)] placeholder:text-[var(--fg-3)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        aria-label="Buscar error en el catálogo"
      />
      {open && results.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-pop)]">
          {results.map((tag) => (
            <li key={tag.code}>
              <button
                type="button"
                onMouseDown={() => onSelect(tag)}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-[var(--surface-2)]"
              >
                <span className="text-sm font-semibold text-[var(--fg-1)]">
                  {formatHumanName(tag.code)}
                </span>
                <span className="font-mono text-[11px] text-[var(--fg-3)]">{tag.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
