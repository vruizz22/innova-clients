import type { Metadata } from 'next'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Dashboard Profe',
  description: 'Dashboard del profesor — alertas, heatmap de dominio y asignación de práctica.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const landingUrl = getPublicRuntimeConfig().landingUrl

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
