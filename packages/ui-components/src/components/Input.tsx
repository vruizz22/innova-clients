import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps): JSX.Element {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--fg-1)]">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        {...props}
        className={[
          'w-full rounded-xl border px-3 py-2 text-sm text-[var(--fg-1)] placeholder:text-[var(--fg-3)]',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-[#D86060] focus:ring-[#D86060] bg-[var(--surface)]'
            : 'border-[var(--border-strong)] focus:ring-[var(--focus-ring)] bg-[var(--surface)] hover:border-[var(--fg-3)]',
          props.disabled ? 'opacity-50 cursor-not-allowed bg-[var(--surface-2)]' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {error ? (
        <p className="text-xs text-[#D86060]" role="alert">
          {error}
        </p>
      ) : null}
      {!error && helperText ? <p className="text-xs text-[var(--fg-2)]">{helperText}</p> : null}
    </div>
  );
}
