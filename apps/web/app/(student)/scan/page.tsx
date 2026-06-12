import Link from 'next/link';
import { Card } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { ScanFlow } from '@/components/practice/ScanFlow';

// Server Component: resolves the student profile, then hands the camera/OCR flow
// to the client. force-dynamic because it depends on the live session.
export const dynamic = 'force-dynamic';

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

export default async function ScanPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const me = await api.getMe();

  let content: JSX.Element;

  if (!me.ok) {
    content =
      me.error.kind === 'http' && me.error.status === 401 ? (
        <StateCard
          title="Inicia sesión para escanear"
          body="Tu sesión no está activa. Vuelve a entrar para subir tu hoja."
        />
      ) : (
        <StateCard
          title="No pudimos cargar el escáner"
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
    content = <ScanFlow studentId={me.data.profileId} />;
  }

  return (
    <div className="mx-auto max-w-[640px]" data-testid="scan-root">
      <Link href="/practice" className="text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Mi práctica
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Escanear cuaderno</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sube una foto de tu ejercicio resuelto y recibe feedback al instante.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  );
}
