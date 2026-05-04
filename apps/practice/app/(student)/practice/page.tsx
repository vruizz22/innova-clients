'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { getItems, type PracticeItem } from '@/lib/api'

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
}

export default function PracticePage(): JSX.Element {
  const [items, setItems] = useState<PracticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadItems(): Promise<void> {
      setLoading(true)
      setError('')
      try {
        const backendItems = await getItems({ topic: 'subtraction_borrow', limit: 10 })
        if (!cancelled) setItems(backendItems)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar ejercicios.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadItems()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="page-wrapper">
      <div className="practice-list-head">
        <h1>Tus ejercicios</h1>
        <p>Resuelve cada ejercicio y recibe retroalimentación inmediata.</p>
      </div>

      {loading ? (
        <div className="practice-empty">
          <p>Cargando ejercicios...</p>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="practice-empty" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="practice-empty">
          <p>No hay ejercicios disponibles por ahora.</p>
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="practice-items">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/practice/${item.id}`} className="practice-item-link">
                <div className="practice-item-inner">
                  <div>
                    <p className="practice-item-skill">{item.skillLabel}</p>
                    <p className="practice-item-problem math">{item.content.problem}</p>
                  </div>
                  <div className="practice-item-badges">
                    <span className={`badge-pill badge-${item.difficulty}`}>
                      {DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--fg-3)' }}
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}

