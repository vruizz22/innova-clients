'use client'

import { MasteryBar } from './MasteryBar'
import type { MasteryState } from '../../../components/api-client'

interface ChildCardProps {
  student: MasteryState
}

export function ChildCard({ student }: ChildCardProps): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--bg)',
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--sp-6)',
        marginBottom: 'var(--sp-4)',
      }}
    >
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--fw-bold)', color: 'var(--fg-1)', margin: 0 }}>
          {student.skillLabel ?? student.skillKey}
        </h2>
      </div>

      <MasteryBar
        pKnown={student.pKnown}
        label={student.skillLabel ?? student.skillKey}
      />
    </div>
  )
}
