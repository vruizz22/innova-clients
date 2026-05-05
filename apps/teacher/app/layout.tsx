import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Dashboard Profe',
  description: 'Dashboard del profesor — alertas, heatmap de dominio y asignación de práctica.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://superprofes.app'

  return (
    <html lang="es">
      <body>
        <header className="app-header">
          <a href={landingUrl} className="app-brand">
            <span className="app-brand-super">Super</span>
            <span className="app-brand-profes">Profes</span>
          </a>
        </header>
        {children}
      </body>
    </html>
  )
}
