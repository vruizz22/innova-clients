import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[#D2F2E0] text-[#194E34] border-[#A8E5C2]',
  warning: 'bg-[#FFF4DB] text-[#7A4F00] border-[#F0D9A0]',
  error:   'bg-[#fce8e8] text-[#7a1a1a] border-[#f5b8b8]',
  info:    'bg-[#DCEDF6] text-[#18506D] border-[#B6DBED]',
  neutral: 'bg-[#F7F8FA] text-[#4F5868] border-[#CDD3DD]',
};

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps): JSX.Element {
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
