import './globals.css'

export const metadata = {
  title: 'SuperProfes · Practice',
  description: 'Practice app — SuperProfes'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
