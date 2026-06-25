import { EmptyState } from '@innova/ui';
import type { ExerciseCardData } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { AssignPracticeClient } from '@/components/teacher/AssignPracticeClient';
import type { BankItemView } from '@/components/teacher/ExerciseBankClient';
import type { Item } from '@innova/api-client';
import { wrapMath } from '@/lib/math';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly searchParams: { readonly itemId?: string };
}

function toItemView(item: Item): BankItemView {
  const expected = item.content.expectedAnswer;
  const data: ExerciseCardData = {
    id: item.id,
    prompt: wrapMath(item.content.prompt),
    canonicalSolution: expected === null || expected === undefined ? '—' : String(expected),
    targetErrorTags: [],
    difficulty: item.difficulty,
    source: 'SYSTEM',
  };
  return {
    ...data,
    topicCode: item.topicCode,
    topicName: item.topicName,
    irtA: item.irtA,
    irtB: item.irtB,
  };
}

export default async function AssignPracticePage({ searchParams }: PageProps): Promise<JSX.Element> {
  const api = getServerApi();
  const [classrooms, items] = await Promise.all([api.getMyClassrooms(), api.listItems()]);

  if (!classrooms.ok) {
    return (
      <EmptyState
        kind="error"
        title="No pudimos cargar tus cursos"
        body="Intenta de nuevo en un momento."
      />
    );
  }

  return (
    <div data-testid="assign-practice-root">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Asignar práctica</h1>
        <p className="mt-1 text-sm text-[var(--fg-2)]">
          Elige alumnos y un ejercicio del banco para asignarles práctica dirigida.
        </p>
      </div>
      <AssignPracticeClient
        courses={classrooms.data.map((c) => ({ id: c.id, name: c.name }))}
        items={items.ok ? items.data.map(toItemView) : []}
        defaultItemId={searchParams.itemId}
      />
    </div>
  );
}
