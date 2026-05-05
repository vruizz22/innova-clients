import type { Metadata } from 'next'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { AppHeader } from '../components/AppHeader'
import './globals.css'

export const metadata: Metadata = {
  title: 'SuperProfes · Practica',
  description: 'Resuelve ejercicios matemáticos y recibe feedback inmediato sobre tus errores procedurales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const landingUrl = getPublicRuntimeConfig().landingUrl

  return (
    <html lang="es">
      <body>
        <AppHeader landingUrl={landingUrl} />
        {children}
      </body>
    </html>
  )
}
