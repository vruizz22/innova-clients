// Innova Typography System
// Inter for body, Plus Jakarta Sans for headings

export const TYPOGRAPHY = {
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'Fira Code', monospace",
  },

  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Semantic typography
export const SEMANTIC_TYPOGRAPHY = {
  h1: {
    fontSize: TYPOGRAPHY.fontSizes['5xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  h2: {
    fontSize: TYPOGRAPHY.fontSizes['4xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
  },
  h3: {
    fontSize: TYPOGRAPHY.fontSizes['3xl'],
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  h4: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  body: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  bodySm: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  bodyXs: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  button: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
} as const;
