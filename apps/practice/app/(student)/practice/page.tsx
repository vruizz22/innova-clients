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

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-[#D2F2E0] text-[#194E34]',
  medium: 'bg-[#FFF4DB] text-[#7A4F00]',
  hard: 'bg-[#fce8e8] text-[#7a1a1a]',
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
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Tus ejercicios</h1>
        <p className="text-sm text-[#4F5868] mt-1">
          Resuelve cada ejercicio y recibe retroalimentación inmediata.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E9F0] p-8 text-center">
          <p className="text-[#4F5868]">No hay ejercicios disponibles por ahora.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/practice/${item.id}`}
                className="block bg-white rounded-2xl border border-[#E5E9F0] p-4 hover:border-[#3FA7D6] hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#3FA7D6] uppercase tracking-wide mb-1">
                      {item.skillLabel}
                    </p>
                    <p className="text-base font-bold text-[#1F2937] font-mono">
                      {item.content.problem}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={[
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        DIFFICULTY_COLOR[item.difficulty] ?? 'bg-[#F7F8FA] text-[#4F5868]',
                      ].join(' ')}
                    >
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
                      className="text-[#A5ADBC] group-hover:text-[#3FA7D6] transition-colors"
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
