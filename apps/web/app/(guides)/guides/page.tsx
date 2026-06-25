import Link from 'next/link';
import { EmptyState } from '@innova/ui';
import type { GuideListItem, StudentGuideListItem } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { getCurrentRole } from '@/lib/role.server';
import { GuideStatusBadge } from '@/components/guides/status';

// Shared `/guides` list — teacher's authored guides or the student's assigned
// guides, branched by role (Server Component).
export const dynamic = 'force-dynamic';

function teacherHref(g: GuideListItem): string {
  if (g.status === 'REVIEW') return `/guides/${g.id}/review`;
  if (g.status === 'PUBLISHED') return `/guides/${g.id}/results`;
  return `/guides/${g.id}`;
}

function TeacherGuideRow({ g }: { g: GuideListItem }): JSX.Element {
  const due = g.dueAt ? new Date(g.dueAt).toLocaleDateString('es-CL') : null;
  return (
    <Link
      href={teacherHref(g)}
      className="sp-lift flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[var(--fg-1)]">{g.title}</p>
        <p className="mt-0.5 text-xs text-[var(--fg-2)]">
          {g.questionCount} pregunta{g.questionCount === 1 ? '' : 's'}
          {due ? ` · entrega ${due}` : ''}
          {g._count ? ` · ${g._count.submissions} entregas` : ''}
        </p>
      </div>
      <GuideStatusBadge status={g.status} />
    </Link>
  );
}

async function TeacherGuidesView(): Promise<JSX.Element> {
  const api = getServerApi();
  const guides = await api.listGuides();

  return (
    <div className="mx-auto max-w-[760px]" data-testid="guides-root">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Guías</h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Sube una guía en PDF, revisa la pauta y publícala para tu curso.
          </p>
        </div>
        <Link
          href="/guides/new"
          className="shrink-0 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
        >
          + Nueva guía
        </Link>
      </div>

      <div className="mt-6">
        {!guides.ok ? (
          <EmptyState
            kind="error"
            title="No pudimos cargar tus guías"
            body={
              guides.error.kind === 'http' && guides.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Hubo un problema de conexión. Intenta de nuevo en un momento.'
            }
          />
        ) : guides.data.items.length === 0 ? (
          <EmptyState
            kind="no-guides"
            title="Aún no tienes guías"
            body="Crea tu primera guía subiendo el PDF que ya usas en clases."
          />
        ) : (
          <div className="sp-stagger flex flex-col gap-3">
            {guides.data.items.map((g) => (
              <TeacherGuideRow key={g.id} g={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentGuideRow({ g }: { g: StudentGuideListItem }): JSX.Element {
  const due = g.dueAt ? new Date(g.dueAt).toLocaleDateString('es-CL') : null;
  const done = g.totalQuestions > 0 && g.gradedQuestions >= g.totalQuestions;
  return (
    <Link
      href={`/guides/${g.id}`}
      className="sp-lift flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[var(--fg-1)]">{g.title}</p>
        <p className="mt-0.5 text-xs text-[var(--fg-2)]">
          {g.gradedQuestions} de {g.totalQuestions} corregidas
          {due ? ` · entrega ${due}` : ''}
        </p>
      </div>
      <span
        className={[
          'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
          done
            ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
            : 'bg-[var(--info-bg)] text-[var(--info-fg)]',
        ].join(' ')}
      >
        {done ? 'Completa' : 'Pendiente'}
      </span>
    </Link>
  );
}

async function StudentGuidesView(): Promise<JSX.Element> {
  const api = getServerApi();
  const guides = await api.listStudentGuides();

  return (
    <div className="mx-auto max-w-[640px]" data-testid="student-guides-root">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Mis guías</h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Responde cada pregunta con una foto de tu desarrollo.
      </p>

      <div className="mt-6">
        {!guides.ok ? (
          <EmptyState
            kind="error"
            title="No pudimos cargar tus guías"
            body={
              guides.error.kind === 'http' && guides.error.status === 401
                ? 'Tu sesión no está activa. Vuelve a entrar.'
                : 'Intenta de nuevo en un momento.'
            }
          />
        ) : guides.data.length === 0 ? (
          <EmptyState
            kind="no-guides"
            title="No tienes guías por ahora"
            body="Cuando tu profe publique una guía, aparecerá aquí."
          />
        ) : (
          <div className="sp-stagger flex flex-col gap-3">
            {guides.data.map((g) => (
              <StudentGuideRow key={g.id} g={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function GuidesPage(): Promise<JSX.Element> {
  const role = await getCurrentRole();
  return role === 'teacher' ? <TeacherGuidesView /> : <StudentGuidesView />;
}
