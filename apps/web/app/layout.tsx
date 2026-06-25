import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.superprofes.app';
const description =
  'Detecta el error procedimental de cada alumno antes de la prueba y asigna práctica dirigida.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'SuperProfes', template: '%s · SuperProfes' },
  description,
  applicationName: 'SuperProfes',
  openGraph: {
    type: 'website',
    siteName: 'SuperProfes',
    locale: 'es_CL',
    title: 'SuperProfes — Detecta el error antes de la prueba',
    description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SuperProfes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuperProfes — Detecta el error antes de la prueba',
    description,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F2A3D' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
