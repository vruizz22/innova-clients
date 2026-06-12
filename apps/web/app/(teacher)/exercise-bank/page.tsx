import { Card } from '@innova/ui';
import type { ExerciseCardData } from '@innova/ui';
import type { Item } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { ExerciseBankClient, type BankItemView } from '@/components/teacher/ExerciseBankClient';

// Server Component: fetches the real item bank from GET /items, then hands a
// serialisable, ExerciseCard-shaped list to the interactive client filter.
export const dynamic = 'force-dynamic';

function toBankItem(item: Item): BankItemView {
  const expected = item.content.expectedAnswer;
  const data: ExerciseCardData = {
    id: item.id,
    prompt: item.content.prompt,
    canonicalSolution: expected === null || expected === undefined ? '—' : String(expected),
    targetErrorTags: [],
    difficulty: item.difficulty,
    source: 'SYSTEM',
  };
  return { ...data, topicCode: item.topicCode, topicName: item.topicName };
}

export default async function ExerciseBankPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const items = await api.listItems();

  return (
    <div data-testid="exercise-bank-root">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Banco de ejercicios</h1>
      <p className="mt-1 text-sm text-slate-500">
        Filtra por tema y dificultad. Asigna o pide variantes con IA.
      </p>

      {!items.ok ? (
        <div className="mt-6">
          <Card>
            <p className="text-sm font-bold text-slate-800">No pudimos cargar el banco</p>
            <p className="mt-1 text-sm text-slate-500">
              {items.error.kind === 'http' && items.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento.'}
            </p>
          </Card>
        </div>
      ) : (
        <ExerciseBankClient items={items.data.map(toBankItem)} />
      )}
    </div>
  );
}
