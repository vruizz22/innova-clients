'use client'

import { usePathname } from 'next/navigation'

type AppHeaderProps = {
  landingUrl: string
}

const AUTH_PATH_PREFIXES = ['/login', '/register', '/forgot', '/reset', '/join']

export function AppHeader({ landingUrl }: AppHeaderProps): JSX.Element | null {
  const pathname = usePathname()

  if (AUTH_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null
  }

  return (
    <header className="app-header">
      <a href={landingUrl} className="app-brand">
        <span className="app-brand-super">Super</span>
        <span className="app-brand-profes">Profes</span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="/practice" className="exercise-back-link" style={{ margin: 0 }}>
          Ejercicios
        </a>
      </nav>
    </header>
  )
}
