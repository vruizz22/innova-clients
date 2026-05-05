'use client'

interface MasteryBarProps {
  pKnown: number
  label?: string
  attemptsCount?: number
}

function getColor(p: number): string {
  if (p >= 0.7) return '#3DAA72'
  if (p >= 0.4) return '#E8A33D'
  return '#D86060'
}

function getLabel(p: number): string {
  if (p >= 0.7) return 'Dominado'
  if (p >= 0.4) return 'En proceso'
  return 'Necesita práctica'
}

export function MasteryBar({ pKnown, label, attemptsCount }: MasteryBarProps): JSX.Element {
  const clamped = Math.min(1, Math.max(0, pKnown))
  const pct = Math.round(clamped * 100)
  const color = getColor(clamped)
  const levelLabel = getLabel(clamped)

  return (
    <div style={{ marginBottom: 'var(--sp-3)' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--fg-1)' }}>
            {label}
          </span>
          {attemptsCount !== undefined && (
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--fg-3)' }}>
              {attemptsCount} intentos
            </span>
          )}
        </div>
      )}
      <div
        style={{
          height: 10,
          borderRadius: 'var(--r-pill)',
          background: 'var(--border)',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 'var(--r-pill)',
            transition: 'width 0.4s var(--ease-standard)',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color }}>{levelLabel}</span>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--fg-3)' }}>{pct}%</span>
      </div>
    </div>
  )
}
