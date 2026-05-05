import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes — Apoderados',
  description: 'Seguimiento del aprendizaje de tu hijo/a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="app-header">
          <a href="/" className="app-brand">
            <span className="app-brand-super">Super</span>
            <span className="app-brand-profes">Profes</span>
          </a>
        </header>
        {children}
      </body>
    </html>
  )
}
