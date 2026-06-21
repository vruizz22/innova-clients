import type { Config } from 'tailwindcss';

// SuperProfes palette (design system colors_and_type.css). Student = sky/mint,
// teacher/parent = slate. Mastery scale never uses alarm red.
const config: Config = {
  darkMode: 'media',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens → CSS vars that flip automatically in dark mode
        // (prefers-color-scheme). Prefer these over raw palette classes so
        // surfaces theme themselves; nothing hardcoded.
        canvas: 'var(--bg)',
        'canvas-student': 'var(--bg-student)',
        'canvas-parent': 'var(--bg-parent)',
        'canvas-teacher': 'var(--bg-teacher)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--fg-1)',
        'ink-muted': 'var(--fg-2)',
        'ink-subtle': 'var(--fg-3)',
        'ink-inverse': 'var(--fg-inverse)',
        line: 'var(--border)',
        'line-strong': 'var(--border-strong)',
        brand: 'var(--primary)',
        'brand-hover': 'var(--primary-hover)',
        'brand-press': 'var(--primary-press)',
        'brand-fg': 'var(--primary-fg)',
        'mark-bg': 'var(--brand-mark-bg)',
        primary: '#3FA7D6',
        'primary-hover': '#2F8DBA',
        'primary-press': '#226E94',
        success: '#3DAA72',
        warning: '#E8A33D',
        danger: '#D86060',
        'mastery-strong': '#3DAA72',
        'mastery-medium': '#E8A33D',
        'mastery-weak': '#D86060',
        sky: {
          50: '#F0F7FB', 100: '#DCEDF6', 200: '#B6DBED', 300: '#84C2DD', 400: '#58B0D2',
          500: '#3FA7D6', 600: '#2F8DBA', 700: '#226E94', 800: '#18506D', 900: '#0F2A3D',
        },
        mint: {
          50: '#ECFAF3', 100: '#D2F2E0', 200: '#A8E5C2', 300: '#76D29F', 400: '#50BF82',
          500: '#3DAA72', 600: '#2D8B5C', 700: '#226B47', 800: '#194E34', 900: '#0F3322',
        },
        slate: {
          50: '#F7F8FA', 100: '#E5E9F0', 200: '#CDD3DD', 300: '#A5ADBC', 400: '#717A8B',
          500: '#4F5868', 600: '#374050', 700: '#232C3A', 800: '#1F2937', 900: '#0F141B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px', pill: '9999px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      // Semantic z-index scale — never arbitrary 999/9999.
      zIndex: {
        base: '0',
        dropdown: '10',
        sticky: '20',
        'modal-backdrop': '30',
        modal: '40',
        popover: '50',
        toast: '60',
        tooltip: '70',
      },
    },
  },
  plugins: [],
};
export default config;
