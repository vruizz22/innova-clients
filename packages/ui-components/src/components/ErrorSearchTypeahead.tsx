'use client';

import React, { useMemo, useState } from 'react';
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
}

/** Fuzzy typeahead over the error catalog — attempt review "reportar otro error" (v8 C4). */
export function ErrorSearchTypeahead({
  onSelect,
  placeholder = 'Buscar error por nombre o código…',
  limit = 8,
  status,
  domainCode,
  className = '',
}: ErrorSearchTypeaheadProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () => searchErrorTags(query, { limit, status, domainCode }),
    [query, limit, status, domainCode],
  );

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
        className="w-full rounded-xl border border-[#CDD3DD] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#A5ADBC] focus:outline-none focus:ring-2 focus:ring-[#3FA7D6]"
        aria-label="Buscar error en el catálogo"
      />
      {open && results.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#E5E9F0] bg-white py-1 shadow-[0_8px_24px_rgba(15,42,61,0.10)]">
          {results.map((tag) => (
            <li key={tag.code}>
              <button
                type="button"
                onMouseDown={() => onSelect(tag)}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-[#F0F7FB]"
              >
                <span className="text-sm font-semibold text-[#1F2937]">
                  {formatHumanName(tag.code)}
                </span>
                <span className="font-mono text-[11px] text-[#717A8B]">{tag.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
