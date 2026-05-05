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
        {children}
      </body>
    </html>
  )
}
