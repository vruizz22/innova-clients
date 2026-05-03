import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VisualErrorRenderer } from '@components/VisualErrorRenderer'

describe('VisualErrorRenderer', () => {
  it('renders known error title and example', () => {
    render(<VisualErrorRenderer slug={'BORROW_OMITTED_TENS'} compact={true} />)
    expect(screen.getByText(/Te faltó pedir prestado a las decenas/i)).toBeTruthy()
    expect(screen.getByText(/Tu respuesta/i)).toBeTruthy()
  })
})
