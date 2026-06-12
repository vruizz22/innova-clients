import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { flattenAssignments } from '@/lib/practice-format';
import { SolveExercise } from '@/components/practice/SolveExercise';

// Server Component: resolves the exercise from the student's live assignments and
// hands a fully-serialisable payload to the client solver. force-dynamic because
// the assignment list is per-session and changes as the student practices.
export const dynamic = 'force-dynamic';

interface SolvePageProps {
  readonly params: { readonly exerciseId: string };
}

function StateCard({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <Card>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
      <Link
        href="/practice"
        className="mt-4 inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
      >
        ← Volver a mi práctica
      </Link>
    </Card>
  );
}

export default async function SolvePage({ params }: SolvePageProps): Promise<JSX.Element> {
  const exerciseId = decodeURIComponent(params.exerciseId);
  const api = getServerApi();
  const me = await api.getMe();

  let content: JSX.Element;

  if (!me.ok) {
    content =
      me.error.kind === 'http' && me.error.status === 401 ? (
        <StateCard
          title="Inicia sesión para resolver"
          body="Tu sesión no está activa. Vuelve a entrar para cargar el ejercicio."
        />
      ) : (
        <StateCard
          title="No pudimos cargar el ejercicio"
          body="Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento."
        />
      );
  } else if (!me.data.profileId) {
    content = (
      <StateCard
        title="Aún no tienes un perfil de estudiante"
        body="Pídele a tu profesor o profesora que te asigne a un curso para empezar a practicar."
      />
    );
  } else {
    const assignments = await api.getStudentAssignments(me.data.profileId);
    if (!assignments.ok) {
      content = (
        <StateCard
          title="No pudimos cargar tus ejercicios"
          body="Hubo un problema al traer tus asignaciones. Intenta de nuevo en un momento."
        />
      );
    } else {
      const exercise = flattenAssignments(assignments.data).find((e) => e.exerciseId === exerciseId);
      if (!exercise) {
        content = (
          <StateCard
            title="Ejercicio no encontrado"
            body="Este ejercicio ya no está en tu lista de práctica. Vuelve para ver los pendientes."
          />
        );
      } else if (exercise.expectedAnswer === null) {
        content = (
          <StateCard
            title="Ejercicio no disponible"
            body="Este ejercicio aún no tiene respuesta esperada configurada. Avísale a tu profe."
          />
        );
      } else {
        content = (
          <SolveExercise
            studentId={me.data.profileId}
            exerciseId={exercise.exerciseId}
            problem={exercise.problem}
            topicCode={exercise.topicCode}
            skill={exercise.skill}
            difficultyLabel={exercise.difficultyLabel}
            expectedAnswer={exercise.expectedAnswer}
          />
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <Link href="/practice" className="text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Mi práctica
      </Link>
      <div className="mt-4">{content}</div>
    </div>
  );
}
