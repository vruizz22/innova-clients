import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Dashboard Profe',
  description: 'Dashboard del profesor — alertas, heatmap de dominio y asignación de práctica.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-[var(--bg-subtle,#F7F8FA)] text-[var(--fg-1,#1F2937)] antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
