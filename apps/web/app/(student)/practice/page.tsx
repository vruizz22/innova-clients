import { Card } from '@innova/ui';

// Mock assignments until POST/GET /assignments is wired (next iteration).
const TODAY = [
  { id: '1', problem: '345 − 178', skill: 'Resta con reserva', difficulty: 'Media' },
  { id: '2', problem: '38 + 27', skill: 'Suma con llevadas', difficulty: 'Fácil' },
  { id: '3', problem: '2/5 + 1/5', skill: 'Fracciones igual denominador', difficulty: 'Media' },
];

export default function PracticePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tu práctica de hoy</h1>
      <p className="mt-1 text-sm text-slate-500">
        {TODAY.length} ejercicios asignados · resuélvelos paso a paso.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {TODAY.map((ex) => (
          <Card key={ex.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="math text-xl font-black text-slate-800">{ex.problem} = ?</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ex.skill} · {ex.difficulty}
                </p>
              </div>
              <button className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
                Resolver →
              </button>
            </div>
          </Card>
        ))}
      </div>

      <a
        href="/scan"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card hover:border-sky-300"
      >
        <span className="text-2xl">📷</span>
        <span>
          <span className="block text-sm font-bold text-slate-800">Escanear cuaderno</span>
          <span className="block text-xs text-slate-500">Sube una foto de tu hoja (OCR)</span>
        </span>
      </a>
    </div>
  );
}
