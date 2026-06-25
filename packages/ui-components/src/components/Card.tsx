import React from 'react';

interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  header,
  footer,
  children,
  className = '',
  padding = 'md',
}: CardProps): JSX.Element {
  return (
    <div
      className={[
        'bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {header ? (
        <div className="px-5 py-3 border-b border-[var(--border)] font-semibold text-[var(--fg-1)]">
          {header}
        </div>
      ) : null}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer ? (
        <div className="px-5 py-3 border-t border-[var(--border)] text-sm text-[var(--fg-2)]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
