import Link from 'next/link';
import { CameraIcon, ChevronRightIcon, EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { flattenAssignments, type PracticeExercise } from '@/lib/practice-format';
import { MathText } from '@/components/latex/MathText';

export const dynamic = 'force-dynamic';

const DIFF_BADGE: Record<string, string> = {
  Fácil: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
  Media: 'bg-[var(--info-bg)] text-[var(--info-fg)]',
  Difícil: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
};

// Wraps LaTeX in $...$ so MathText can render it without losing prose spaces.
// "Resuelve: \frac{x}{5} = 8" → "Resuelve: $\frac{x}{5} = 8$"
// "Si \frac{x}{4} = 5, escribe..." → "Si $\frac{x}{4}$ = 5, escribe..."
function wrapMath(s: string): string {
  if (!s.includes('\\')) return s;
  const colonIdx = s.indexOf(': ');
  if (colonIdx > 0 && s.slice(colonIdx + 2).includes('\\')) {
    return `${s.slice(0, colonIdx + 2)}$${s.slice(colonIdx + 2)}$`;
  }
  return s.replace(/\\[a-zA-Z]+(?:\{[^}]*\}|\[[^\]]*\])*/g, '$$&$');
}

function ExerciseRow({ ex }: { ex: PracticeExercise }): JSX.Element {
  const diffBadge = DIFF_BADGE[ex.difficultyLabel] ?? 'bg-[var(--surface-2)] text-[var(--fg-2)]';
  // "Resuelve: ..." exercises already state a full equation — don't append "= ?"
  const showQmark = !ex.problem.includes(':');
  const displayProblem = wrapMath(ex.problem);
  return (
    <Link
      href={`/practice/solve/${encodeURIComponent(ex.exerciseId)}`}
      data-testid="practice-solve-link"
      className="sp-lift block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xl font-black leading-snug text-[var(--fg-1)]">
          <MathText>{displayProblem}</MathText>
          {showQmark ? ' = ?' : ''}
        </p>
        <ChevronRightIcon size={20} className="mt-0.5 shrink-0 text-[var(--fg-3)]" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-[var(--fg-2)]">{ex.skill}</span>
        <span className={['rounded-full px-2 py-0.5 text-[10px] font-bold', diffBadge].join(' ')}>
          {ex.difficultyLabel}
        </span>
      </div>
    </Link>
  );
}

function ScanCta(): JSX.Element {
  return (
    <Link
      href="/scan"
      className="sp-lift mt-6 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--primary)]/40 hover:bg-[var(--info-bg)]/30"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--info-bg)]">
        <CameraIcon size={20} className="text-[var(--primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[var(--fg-1)]">Escanear cuaderno</span>
        <span className="block text-xs text-[var(--fg-2)]">Sube una foto de tu hoja · OCR</span>
      </div>
      <ChevronRightIcon size={18} className="shrink-0 text-[var(--fg-3)]" />
    </Link>
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
        <EmptyState
          kind="error"
          title="Inicia sesión para ver tu práctica"
          body="Tu sesión no está activa. Vuelve a entrar para cargar tus ejercicios."
        />
      ) : (
        <EmptyState
          kind="error"
          title="No pudimos cargar tu práctica"
          body="Hubo un problema de conexión con el servidor. Intenta de nuevo en un momento."
        />
      );
  } else if (!me.data.profileId) {
    content = (
      <EmptyState
        kind="no-profile"
        title="Aún no tienes un perfil de estudiante"
        body="Pídele a tu profesor o profesora que te asigne a un curso para empezar a practicar."
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
        />
      );
    } else {
      const exercises = flattenAssignments(assignments.data);
      if (exercises.length === 0) {
        content = (
          <EmptyState
            kind="no-exercises"
            title="¡Estás al día!"
            body="No tienes ejercicios pendientes por ahora. Puedes escanear tu cuaderno para practicar."
          />
        );
      } else {
        subtitle = `${exercises.length} ejercicio${exercises.length === 1 ? '' : 's'} asignado${
          exercises.length === 1 ? '' : 's'
        } · resuélvelos paso a paso.`;
        content = (
          <div className="sp-stagger flex flex-col gap-3">
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
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Tu práctica de hoy</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">{subtitle}</p>
      <div className="mt-6">{content}</div>
      <ScanCta />
      <Link
        href="/join"
        className="mt-4 block text-center text-sm font-medium text-[var(--primary)] underline-offset-2 hover:underline"
      >
        Tengo un código de curso →
      </Link>
    </div>
  );
}
