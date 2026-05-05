import { VisualErrorRenderer } from '@components/VisualErrorRenderer'

const ERROR_SLUGS = ['BORROW_OMITTED_TENS', 'CARRY_OMITTED', 'ZERO_TIMES_X_NONZERO', 'COMMON_DENOMINATOR_MISSED'] as const

export default function ErrorGalleryPage(): JSX.Element {
  return (
    <main className="error-gallery">
      <div>
        <h1 style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-bold)', margin: '0 0 var(--sp-1)' }}>
          Galería de errores visuales
        </h1>
        <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
          Vista previa de las tarjetas de error procedural mostradas tras un intento.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        {ERROR_SLUGS.map((slug) => (
          <VisualErrorRenderer key={slug} slug={slug} compact />
        ))}
      </div>
    </main>
  )
}
