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
        'bg-white rounded-2xl border border-[#E5E9F0] shadow-[0_6px_20px_rgba(17,24,39,0.06)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {header ? (
        <div className="px-5 py-3 border-b border-[#E5E9F0] font-semibold text-[#1F2937]">
          {header}
        </div>
      ) : null}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer ? (
        <div className="px-5 py-3 border-t border-[#E5E9F0] text-sm text-[#4F5868]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
