import { Card, MasteryBar } from '@innova/ui';

// Mock child summary until GET /mastery/student/:id/by-unit is wired.
const CHILD = {
  name: 'María',
  exercisesThisWeek: 8,
  skills: [
    { id: 'sub', name: 'Resta con reserva', pKnown: 0.55 },
    { id: 'add', name: 'Suma con llevadas', pKnown: 0.78 },
    { id: 'frac', name: 'Fracciones', pKnown: 0.32 },
  ],
};

export default function FamilyPage(): JSX.Element {
  const dominated = CHILD.skills.filter((s) => s.pKnown >= 0.7).length;

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Progreso de {CHILD.name}</h1>
      <p className="mt-1 text-sm text-slate-500">Resumen de su aprendizaje matemático.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ejercicios esta semana
          </p>
          <p className="mt-1 text-3xl font-black text-sky-600">{CHILD.exercisesThisWeek}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dominadas</p>
          <p className="mt-1 text-3xl font-black text-mint-600">
            {dominated} <span className="text-base text-slate-400">/ {CHILD.skills.length}</span>
          </p>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-bold text-slate-700">Progreso por habilidad</h2>
      <div className="flex flex-col gap-3">
        {CHILD.skills.map((s) => (
          <Card key={s.id}>
            <MasteryBar pKnown={s.pKnown} label={s.name} showValue />
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
        <span className="text-lg">🔒</span>
        <p className="text-xs leading-5 text-slate-500">
          Los datos de tu hijo/a son privados. No compartimos información personal con terceros.
          Cumplimos COPPA y la Ley 21.180.
        </p>
      </div>
    </div>
  );
}
