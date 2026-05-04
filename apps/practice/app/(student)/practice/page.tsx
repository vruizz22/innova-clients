// Practice assignments list — server component
// Fetches available items from the API and renders them

import Link from 'next/link';

interface PracticeItem {
  id: string;
  skillKey: string;
  skillLabel: string;
  content: { problem: string };
  difficulty: 'easy' | 'medium' | 'hard';
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

// Mock items for SSR — replaced by API data when available
const MOCK_ITEMS: PracticeItem[] = [
  { id: 'item-001', skillKey: 'subtraction_borrow', skillLabel: 'Resta con reagrupación', content: { problem: '53 − 26 = ?' }, difficulty: 'medium' },
  { id: 'item-002', skillKey: 'subtraction_borrow', skillLabel: 'Resta con reagrupación', content: { problem: '82 − 47 = ?' }, difficulty: 'medium' },
  { id: 'item-003', skillKey: 'addition_carry', skillLabel: 'Suma con llevada', content: { problem: '68 + 47 = ?' }, difficulty: 'easy' },
  { id: 'item-004', skillKey: 'multiplication_basic', skillLabel: 'Multiplicación básica', content: { problem: '7 × 8 = ?' }, difficulty: 'easy' },
  { id: 'item-005', skillKey: 'fractions_add', skillLabel: 'Suma de fracciones', content: { problem: '1/3 + 1/4 = ?' }, difficulty: 'hard' },
];

async function getItems(): Promise<PracticeItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return MOCK_ITEMS;
  try {
    const res = await fetch(`${apiUrl}/items?topic=subtraction_borrow&limit=10`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return MOCK_ITEMS;
    return res.json() as Promise<PracticeItem[]>;
  } catch {
    return MOCK_ITEMS;
  }
}

export default async function PracticePage(): Promise<JSX.Element> {
  const items = await getItems();

  return (
    <main className="page-wrapper">
      <div className="practice-list-head">
        <h1>Tus ejercicios</h1>
        <p>Resuelve cada ejercicio y recibe retroalimentación inmediata.</p>
      </div>

      {items.length === 0 ? (
        <div className="practice-empty">
          <p>No hay ejercicios disponibles por ahora.</p>
        </div>
      ) : (
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
      )}
    </main>
  );
}
