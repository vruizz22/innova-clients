/**
 * SuperProfes — Design Tokens (TypeScript)
 * Consumable layer that maps design-system CSS variables to typed constants.
 * Single source of truth lives in colors_and_type.css — these are thin
 * var(--…) references, not hardcoded values, so CSS always wins.
 */
export const SP_TOKENS = {
  colors: {
    canvas:      'var(--bg-canvas)',
    student:     'var(--bg-student)',
    parent:      'var(--bg-parent)',
    sky600:      'var(--sky-600)',
    sky700:      'var(--sky-700)',
    slate900:    'var(--slate-900)',
    fg1:         'var(--fg-1)',
    fg2:         'var(--fg-2)',
    border:      'var(--border)',
    errorBg:     'var(--error-bg)',
    errorBorder: 'var(--error-border)',
  },
  radius: {
    sm:   'var(--r-sm)',
    md:   'var(--r-md)',
    lg:   'var(--r-lg)',
    xl:   'var(--r-xl)',
    '2xl':'var(--r-2xl)',
    pill: 'var(--r-pill)',
  },
  spacing: {
    1:  'var(--sp-1)',
    2:  'var(--sp-2)',
    3:  'var(--sp-3)',
    4:  'var(--sp-4)',
    5:  'var(--sp-5)',
    6:  'var(--sp-6)',
    8:  'var(--sp-8)',
    10: 'var(--sp-10)',
    14: 'var(--sp-14)',
    20: 'var(--sp-20)',
  },
} as const;

export type SuperProfesTokens = typeof SP_TOKENS;
