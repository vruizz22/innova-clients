import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Practica',
  description: 'Resuelve ejercicios matemáticos y recibe feedback inmediato sobre tus errores procedurales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://superprofes.app'

  return (
    <html lang="es">
      <body>
        <header className="app-header">
          <a href="/practice" className="app-brand">
            <span className="app-brand-super">Super</span>
            <span className="app-brand-profes">Profes</span>
          </a>
          <nav aria-label="Navegación principal">
            <a href={landingUrl} className="exercise-back-link" style={{ margin: 0 }}>
              Inicio
            </a>
            <a href="/practice" className="exercise-back-link" style={{ margin: 0 }}>
              Ejercicios
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
