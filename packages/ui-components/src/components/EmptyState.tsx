import type { ReactNode } from 'react';

// ---- SVG illustrations — inline, DS-token-aware, no external deps ----

function IlluNoCourses(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="8" y="20" width="48" height="36" rx="4" stroke="var(--fg-3)" strokeWidth="2.5" />
      <rect x="16" y="12" width="32" height="12" rx="3" stroke="var(--fg-3)" strokeWidth="2.5" />
      <line x1="20" y1="34" x2="44" y2="34" stroke="var(--fg-3)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="42" x2="36" y2="42" stroke="var(--fg-3)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IlluNoGuides(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="12" y="8" width="34" height="44" rx="4" stroke="var(--fg-3)" strokeWidth="2.5" />
      <line x1="20" y1="20" x2="38" y2="20" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="28" x2="38" y2="28" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="36" x2="30" y2="36" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="46" r="10" fill="var(--bg)" stroke="var(--fg-3)" strokeWidth="2.5" />
      <line x1="43" y1="46" x2="49" y2="46" stroke="var(--fg-3)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="43" x2="46" y2="49" stroke="var(--fg-3)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IlluNoExercises(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="20" stroke="var(--fg-3)" strokeWidth="2.5" />
      <polyline
        points="22,33 29,40 43,25"
        stroke="var(--success-fg)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IlluNoAlerts(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 12 C22 12 16 20 16 28 L16 38 L12 44 L52 44 L48 38 L48 28 C48 20 42 12 32 12 Z"
        stroke="var(--fg-3)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M27 44 C27 47 29.2 49 32 49 C34.8 49 37 47 37 44"
        stroke="var(--fg-3)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="18" r="8" fill="var(--success-bg)" stroke="var(--success-fg)" strokeWidth="2" />
      <polyline
        points="40,18 43,21 48,15"
        stroke="var(--success-fg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IlluNoData(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <line x1="10" y1="52" x2="54" y2="52" stroke="var(--fg-3)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="14" y="38" width="8" height="14" rx="2" stroke="var(--fg-3)" strokeWidth="2" />
      <rect x="28" y="28" width="8" height="24" rx="2" stroke="var(--fg-3)" strokeWidth="2" />
      <rect x="42" y="20" width="8" height="32" rx="2" stroke="var(--fg-3)" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  );
}

function IlluNoProfile(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="22" r="10" stroke="var(--fg-3)" strokeWidth="2.5" />
      <path
        d="M14 50 C14 40 20 36 32 36 C44 36 50 40 50 50"
        stroke="var(--fg-3)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="20" r="8" fill="var(--warning-bg)" stroke="var(--warning-fg)" strokeWidth="2" />
      <line x1="50" y1="16" x2="50" y2="21" stroke="var(--warning-fg)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="24" r="1" fill="var(--warning-fg)" />
    </svg>
  );
}

function IlluNoChildren(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="9" stroke="var(--fg-3)" strokeWidth="2.5" />
      <path
        d="M6 50 C6 41 13 37 22 37 C31 37 38 41 38 50"
        stroke="var(--fg-3)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="46" cy="30" r="7" stroke="var(--fg-3)" strokeWidth="2" strokeDasharray="3 2" />
      <line x1="43" y1="30" x2="49" y2="30" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="27" x2="46" y2="33" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IlluError(): JSX.Element {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="20" stroke="var(--error-fg)" strokeWidth="2.5" />
      <line x1="32" y1="22" x2="32" y2="35" stroke="var(--error-fg)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="41" r="2" fill="var(--error-fg)" />
    </svg>
  );
}

const ILLUSTRATIONS = {
  'no-courses': IlluNoCourses,
  'no-guides': IlluNoGuides,
  'no-exercises': IlluNoExercises,
  'no-alerts': IlluNoAlerts,
  'no-data': IlluNoData,
  'no-profile': IlluNoProfile,
  'no-children': IlluNoChildren,
  error: IlluError,
  generic: IlluNoData,
} as const;

export type EmptyStateKind = keyof typeof ILLUSTRATIONS;

export interface EmptyStateProps {
  /** Visual illustration variant. Defaults to `"generic"`. */
  readonly kind?: EmptyStateKind;
  /** Primary message — short, sentence-case. */
  readonly title: string;
  /** Optional supporting text below the title. */
  readonly body?: string;
  /** Optional action button or link (pass a `<Button>` or `<Link>`). */
  readonly action?: ReactNode;
  /** Additional wrapper classes. */
  readonly className?: string;
}

/**
 * Contextual empty state with an inline SVG illustration, title, optional body,
 * and optional action. All colours track DS tokens so dark mode works automatically.
 *
 * ```tsx
 * <EmptyState
 *   kind="no-alerts"
 *   title="Sin alertas pendientes"
 *   body="Te avisaremos aquí cuando detectemos alumnos en riesgo."
 * />
 * ```
 */
export function EmptyState({
  kind = 'generic',
  title,
  body,
  action,
  className,
}: EmptyStateProps): JSX.Element {
  const Illustration = ILLUSTRATIONS[kind];

  return (
    <div
      className={[
        'flex flex-col items-center gap-4 rounded-2xl px-6 py-10 text-center',
        'bg-[var(--surface-2)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)]">
        <Illustration />
      </div>
      <div className="max-w-[280px]">
        <p className="text-sm font-semibold text-[var(--fg-1)]">{title}</p>
        {body ? <p className="mt-1 text-xs leading-relaxed text-[var(--fg-2)]">{body}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
