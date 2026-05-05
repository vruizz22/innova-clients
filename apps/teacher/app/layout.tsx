import type { Metadata } from 'next'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { AppHeader } from '../components/AppHeader'
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
        <AppHeader landingUrl={landingUrl} />
        {children}
      </body>
    </html>
  )
}
