// SuperProfes Color System
// Primary: Student mastery, math learning focus
// Secondary: Teacher insights and analytics
// Accent: Gamification and engagement

export const COLORS = {
  // Primary palette - Student focus
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#082f49',
  },

  // Secondary palette - Teacher/Analytics
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Secondary
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  // Accent palette - Gamification
  accent: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#fbbf24',
    400: '#f59e0b',
    500: '#f97316', // Accent
    600: '#ea580c',
    700: '#c2410c',
    800: '#92400e',
    900: '#78350f',
  },

  // Semantic colors
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
  },

  // Neutral
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Dark mode background
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
  },

  // Light mode background
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
  },
} as const;

export type ColorToken = keyof typeof COLORS;
export type ColorScale = keyof (typeof COLORS)[ColorToken];

// CSS Variables for Tailwind
export const colorVariables = {
  '--color-primary': 'hsl(199 89% 48%)',
  '--color-secondary': 'hsl(142 76% 36%)',
  '--color-accent': 'hsl(25 95% 53%)',
} as const;
