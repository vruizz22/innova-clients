export const SP_TOKENS = {
  colors: {
    canvas: 'var(--bg-canvas)',
    student: 'var(--bg-student)',
    parent: 'var(--bg-parent)',
    sky600: 'var(--sky-600)',
    sky700: 'var(--sky-700)',
    slate900: 'var(--slate-900)',
    fg1: 'var(--fg-1)',
    fg2: 'var(--fg-2)',
    border: 'var(--border)',
    errorBg: 'var(--error-bg)',
    errorBorder: 'var(--error-border)',
  },
  radius: {
    lg: '12px',
    xl: '18px',
    '2xl': '24px',
    pill: '9999px',
  },
  spacing: {
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
  },
} as const

export type SuperProfesTokens = typeof SP_TOKENS
