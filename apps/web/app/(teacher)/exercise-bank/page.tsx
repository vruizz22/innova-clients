import { EmptyState } from '@innova/ui';
import type { ExerciseCardData } from '@innova/ui';
import type { Item } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { ExerciseBankClient, type BankItemView } from '@/components/teacher/ExerciseBankClient';
import { wrapMath } from '@/lib/math';

export const dynamic = 'force-dynamic';

function toBankItem(item: Item): BankItemView {
  const rawSolution =
    item.content.expectedAnswer != null
      ? String(item.content.expectedAnswer)
      : (item.content.correct_answer_latex ?? null);
  const src = item.source;
  const data: ExerciseCardData = {
    id: item.id,
    prompt: wrapMath(item.content.prompt),
    canonicalSolution: rawSolution != null ? wrapMath(rawSolution) : '—',
    targetErrorTags: [],
    difficulty: item.difficulty,
    source: src === 'TEACHER_AUTHORED' || src === 'LLM_GENERATED' ? src : 'SYSTEM',
    usedCount: item.n ?? undefined,
  };
  return { ...data, topicCode: item.topicCode, topicName: item.topicName, irtA: item.irtA, irtB: item.irtB };
}

export default async function ExerciseBankPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const items = await api.listItems();

  return (
    <div data-testid="exercise-bank-root">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Banco de ejercicios</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Filtra por tema y dificultad. Asigna o pide variantes con IA.
      </p>

      {!items.ok ? (
        <EmptyState
          kind="error"
          title="No pudimos cargar el banco"
          body={
            items.error.kind === 'http' && items.error.status === 401
              ? 'Tu sesión no está activa. Vuelve a entrar.'
              : 'Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento.'
          }
          className="mt-6"
        />
      ) : (
        <ExerciseBankClient items={items.data.map(toBankItem)} />
      )}
    </div>
  );
}
