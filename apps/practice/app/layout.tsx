import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Practica',
  description: 'Resuelve ejercicios matemáticos y recibe feedback inmediato sobre tus errores procedurales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-[var(--bg-student,#F0F7FB)] text-[var(--fg-1,#1F2937)] antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
