'use client';

import { useEffect, useRef, useState } from 'react';
import { getUserInitials } from '@innova/supabase';

interface ProfileMenuProps {
  readonly name: string;
  readonly email: string;
  readonly roleLabel: string;
}

/**
 * Account menu in the app header. Shows the signed-in user's name (never the
 * raw email in the trigger), with their email + role inside the popover, a link
 * to the full profile, and sign-out. Origin-aware popover that scales from the
 * trigger; closes on outside-click and Escape; respects reduced motion.
 */
export function ProfileMenu({ name, email, roleLabel }: ProfileMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = getUserInitials(name);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-pill border border-line py-1 pl-1 pr-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 active:scale-[0.98]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-brand-fg">
          {initials}
        </span>
        <span className="hidden max-w-[14ch] truncate sm:inline">{name}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="text-ink-subtle"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="profile-menu absolute right-0 top-[calc(100%+8px)] z-popover w-64 origin-top-right overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-ink-muted">{email}</p>
            <span className="mt-2 inline-block rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              {roleLabel}
            </span>
          </div>
          <a
            role="menuitem"
            href="/account"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            Ver perfil
          </a>
          <form action="/auth/signout" method="post" className="border-t border-line">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
