import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { GuideUploader, type CourseOption } from '@/components/guides/GuideUploader';

// Server Component: provides the teacher's courses to the upload form.
export const dynamic = 'force-dynamic';

export default async function NewGuidePage(): Promise<JSX.Element> {
  const api = getServerApi();
  const classrooms = await api.getMyClassrooms();

  const courses: CourseOption[] = classrooms.ok
    ? classrooms.data.map((c) => ({ id: c.id, name: c.name }))
    : [];

  return (
    <div className="mx-auto max-w-[640px]">
      <Link href="/guides" className="text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Guías
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Nueva guía</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sube el PDF de tu guía. Generaremos la pauta para que la revises antes de publicar.
      </p>

      <div className="mt-6">
        {!classrooms.ok ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No pudimos cargar tus cursos</p>
            <p className="mt-1 text-sm text-slate-500">Intenta de nuevo en un momento.</p>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <p className="text-sm font-bold text-slate-800">No tienes cursos asignados</p>
            <p className="mt-1 text-sm text-slate-500">
              Pídele a tu administrador que te agregue a un curso para crear guías.
            </p>
          </Card>
        ) : (
          <GuideUploader courses={courses} />
        )}
      </div>
    </div>
  );
}
