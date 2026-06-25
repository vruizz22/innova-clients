import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[var(--success-bg)] text-[var(--success-fg)] border-[var(--success-bg)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning-fg)] border-[var(--warning-bg)]',
  error: 'bg-[var(--error-bg)] text-[var(--error-fg)] border-[var(--error-border)]',
  info: 'bg-[var(--info-bg)] text-[var(--info-fg)] border-[var(--info-bg)]',
  neutral: 'bg-[var(--surface-2)] text-[var(--fg-2)] border-[var(--border)]',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
