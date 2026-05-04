// Innova Breakpoints
// Mobile-first approach

export const BREAKPOINTS = {
  xs: '320px', // mobile
  sm: '640px', // small tablet
  md: '768px', // tablet
  lg: '1024px', // desktop
  xl: '1280px', // large desktop
  '2xl': '1536px', // ultra-wide
} as const;

export const BREAKPOINT_KEYS = Object.keys(BREAKPOINTS) as Array<keyof typeof BREAKPOINTS>;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Helper for media queries
export function mediaQuery(breakpoint: BreakpointKey): string {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]})`;
}
