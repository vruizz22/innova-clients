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
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#1F2937]"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        {...props}
        className={[
          'w-full rounded-xl border px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#A5ADBC]',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-[#D86060] focus:ring-[#D86060] bg-[#fff8f8]'
            : 'border-[#CDD3DD] focus:ring-[#3FA7D6] bg-white hover:border-[#A5ADBC]',
          props.disabled ? 'opacity-50 cursor-not-allowed bg-[#F7F8FA]' : '',
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
      {!error && helperText ? (
        <p className="text-xs text-[#4F5868]">{helperText}</p>
      ) : null}
    </div>
  );
}
