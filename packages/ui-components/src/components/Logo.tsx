import React from 'react';

/**
 * SuperProfes brand logo — inline SVG so it inherits `currentColor` and adapts
 * to light/dark themes (the wordmark "Super" follows `color`, "Profes" + the
 * progress bars use the brand `--primary` token). Never ship the raw "SP" box.
 *
 * - `full`  → wordmark (bars + "SuperProfes"), 5:1 aspect ratio.
 * - `mark`  → standalone square mark (favicon / collapsed nav), 1:1.
 *
 * Color comes from the surrounding text color (e.g. `text-ink`, `text-white`),
 * so the same component works on light surfaces, dark surfaces and the hero.
 */
type LogoVariant = 'full' | 'mark';

interface LogoProps {
  readonly variant?: LogoVariant;
  /** Rendered height in px; width scales with the aspect ratio. */
  readonly height?: number;
  readonly className?: string;
  readonly title?: string;
}

export function Logo({
  variant = 'full',
  height = 28,
  className = '',
  title = 'SuperProfes',
}: LogoProps): JSX.Element {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 48 48"
        width={height}
        height={height}
        role="img"
        aria-label={title}
        className={className}
      >
        <rect width="48" height="48" rx="12" fill="var(--brand-mark-bg, #F0F7FB)" />
        <g transform="translate(10 12)">
          <rect x="0" y="0" width="28" height="5" rx="2.5" fill="var(--primary, #3FA7D6)" />
          <rect x="0" y="10" width="20" height="5" rx="2.5" fill="var(--mint-500, #3DAA72)" />
          <rect x="0" y="20" width="24" height="5" rx="2.5" fill="var(--primary, #3FA7D6)" opacity="0.55" />
        </g>
      </svg>
    );
  }

  const width = (height * 280) / 56;
  return (
    <svg
      viewBox="0 0 280 56"
      width={width}
      height={height}
      role="img"
      aria-label={title}
      className={className}
    >
      <g transform="translate(8 12)">
        <rect x="0" y="0" width="32" height="6" rx="3" fill="var(--primary, #3FA7D6)" />
        <rect x="0" y="12" width="22" height="6" rx="3" fill="var(--mint-500, #3DAA72)" />
        <rect x="0" y="24" width="28" height="6" rx="3" fill="var(--primary, #3FA7D6)" opacity="0.55" />
      </g>
      <text
        x="52"
        y="38"
        fontFamily="Inter, sans-serif"
        fontWeight={700}
        fontSize="28"
        letterSpacing="-0.025em"
        fill="currentColor"
      >
        Super<tspan fill="var(--primary, #3FA7D6)">Profes</tspan>
      </text>
    </svg>
  );
}
