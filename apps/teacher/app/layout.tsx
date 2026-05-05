import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Dashboard Profe',
  description: 'Dashboard del profesor — alertas, heatmap de dominio y asignación de práctica.',
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
