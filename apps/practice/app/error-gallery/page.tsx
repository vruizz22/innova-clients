import { VisualErrorRenderer } from '@components/VisualErrorRenderer'

const ERROR_SLUGS = ['BORROW_OMITTED_TENS', 'CARRY_OMITTED', 'ZERO_TIMES_X_NONZERO', 'COMMON_DENOMINATOR_MISSED'] as const

export default function ErrorGalleryPage(): JSX.Element {
  return (
    <main className="container">
      <section className="card" style={{ display: 'grid', gap: 20 }}>
        <div>
          <h1>Visual Error Renderer Gallery</h1>
          <p>Preview the procedural error cards that will be shown after a practice attempt.</p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {ERROR_SLUGS.map((slug) => (
            <VisualErrorRenderer key={slug} slug={slug} compact />
          ))}
        </div>
      </section>
    </main>
  )
}
