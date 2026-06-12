import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { flattenAssignments, type PracticeExercise } from '@/lib/practice-format';

// Server Component: no client state. Auth token is attached server-side via the
// Supabase session cookie (see lib/api.server.ts). Revalidate on every request
// so a freshly assigned practice shows up without a manual refresh.
export const dynamic = 'force-dynamic';

function StateCard({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <Card>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </Card>
  );
}

function ScanCta(): JSX.Element {
  return (
    <Link
      href="/scan"
      className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card hover:border-sky-300"
    >
      <span className="text-2xl">📷</span>
      <span>
        <span className="block text-sm font-bold text-slate-800">Escanear cuaderno</span>
        <span className="block text-xs text-slate-500">Sube una foto de tu hoja (OCR)</span>
      </span>
    </Link>
  );
}

function ExerciseRow({ ex }: { ex: PracticeExercise }): JSX.Element {
  return (
    <Card key={ex.exerciseId}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="math text-xl font-black text-slate-800">{ex.problem} = ?</p>
          <p className="mt-1 text-xs text-slate-500">
            {ex.skill} · {ex.difficultyLabel}
          </p>
        </div>
        <Link
          href={`/practice/solve/${encodeURIComponent(ex.exerciseId)}`}
          data-testid="practice-solve-link"
          className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Resolver →
        </Link>
      </div>
    </Card>
  );
}

export default async function PracticePage(): Promise<JSX.Element> {
  const api = getServerApi();
  const me = await api.getMe();

  let content: JSX.Element;
  let subtitle = 'Resuélvelos paso a paso.';

  if (!me.ok) {
    content =
      me.error.kind === 'http' && me.error.status === 401 ? (
        <StateCard
          title="Inicia sesión para ver tu práctica"
          body="Tu sesión no está activa. Vuelve a entrar para cargar tus ejercicios."
        />
      ) : (
        <StateCard
          title="No pudimos cargar tu práctica"
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
      const exercises = flattenAssignments(assignments.data);
      if (exercises.length === 0) {
        content = (
          <StateCard
            title="¡Estás al día! 🎉"
            body="No tienes ejercicios pendientes por ahora. Puedes escanear tu cuaderno para practicar."
          />
        );
      } else {
        subtitle = `${exercises.length} ejercicio${exercises.length === 1 ? '' : 's'} asignado${
          exercises.length === 1 ? '' : 's'
        } · resuélvelos paso a paso.`;
        content = (
          <div className="flex flex-col gap-3">
            {exercises.map((ex) => (
              <ExerciseRow key={ex.exerciseId} ex={ex} />
            ))}
          </div>
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-[640px]" data-testid="practice-root">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tu práctica de hoy</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">{content}</div>
      <ScanCta />
    </div>
  );
}
