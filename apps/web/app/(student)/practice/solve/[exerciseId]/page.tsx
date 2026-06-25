import Link from 'next/link';
import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { flattenAssignments } from '@/lib/practice-format';
import { SolveExercise } from '@/components/practice/SolveExercise';

export const dynamic = 'force-dynamic';

interface SolvePageProps {
  readonly params: { readonly exerciseId: string };
}

const backToPractice = (
  <Link
    href="/practice"
    className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
  >
    ← Volver a mi práctica
  </Link>
);

export default async function SolvePage({ params }: SolvePageProps): Promise<JSX.Element> {
  const exerciseId = decodeURIComponent(params.exerciseId);
  const api = getServerApi();
  const me = await api.getMe();

  let content: JSX.Element;

  if (!me.ok) {
    content =
      me.error.kind === 'http' && me.error.status === 401 ? (
        <EmptyState
          kind="error"
          title="Inicia sesión para resolver"
          body="Tu sesión no está activa. Vuelve a entrar para cargar el ejercicio."
          action={backToPractice}
        />
      ) : (
        <EmptyState
          kind="error"
          title="No pudimos cargar el ejercicio"
          body="Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento."
          action={backToPractice}
        />
      );
  } else if (!me.data.profileId) {
    content = (
      <EmptyState
        kind="no-profile"
        title="Aún no tienes un perfil de estudiante"
        body="Pídele a tu profesor o profesora que te asigne a un curso para empezar a practicar."
        action={backToPractice}
      />
    );
  } else {
    const assignments = await api.getStudentAssignments(me.data.profileId);
    if (!assignments.ok) {
      content = (
        <EmptyState
          kind="error"
          title="No pudimos cargar tus ejercicios"
          body="Hubo un problema al traer tus asignaciones. Intenta de nuevo en un momento."
          action={backToPractice}
        />
      );
    } else {
      const exercise = flattenAssignments(assignments.data).find(
        (e) => e.exerciseId === exerciseId
      );
      if (!exercise) {
        content = (
          <EmptyState
            kind="no-data"
            title="Ejercicio no encontrado"
            body="Este ejercicio ya no está en tu lista de práctica. Vuelve para ver los pendientes."
            action={backToPractice}
          />
        );
      } else {
        content = (
          <SolveExercise
            studentId={me.data.profileId}
            exerciseId={exercise.exerciseId}
            problem={exercise.problem}
            skill={exercise.skill}
            difficultyLabel={exercise.difficultyLabel}
          />
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <Link href="/practice" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
        ← Mi práctica
      </Link>
      <div className="mt-4">{content}</div>
    </div>
  );
}
