'use client';

import { usePathname } from 'next/navigation';
import { AlertsBadge } from './AlertsBadge';

interface NavLink {
  readonly href: string;
  readonly label: string;
}

/**
 * Primary section nav. Highlights the active route (exact or nested) so the
 * user always knows where they are — a small detail that compounds.
 */
export function NavLinks({ links }: { links: readonly NavLink[] }): JSX.Element {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={[
              'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
              active ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
            ].join(' ')}
          >
            {link.label}
          {link.href === '/alerts' ? <AlertsBadge /> : null}
          </a>
        );
      })}
    </>
  );
}
