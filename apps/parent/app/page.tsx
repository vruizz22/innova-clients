'use client'

import { useEffect } from 'react'
import { getStoredSession } from '@shared/auth-session'

export default function RootPage(): JSX.Element {
  useEffect(() => {
    const session = getStoredSession()
    if (session) {
      window.location.replace('/dashboard')
    } else {
      window.location.replace('/login')
    }
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--fg-3)' }}>Cargando...</p>
    </div>
  )
}
