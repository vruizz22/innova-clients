import Link from 'next/link';
import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { ScanFlow } from '@/components/practice/ScanFlow';

export const dynamic = 'force-dynamic';

const backToPractice = (
  <Link
    href="/practice"
    className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
  >
    ← Volver a mi práctica
  </Link>
);

export default async function ScanPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const me = await api.getMe();

  let content: JSX.Element;

  if (!me.ok) {
    content =
      me.error.kind === 'http' && me.error.status === 401 ? (
        <EmptyState
          kind="error"
          title="Inicia sesión para escanear"
          body="Tu sesión no está activa. Vuelve a entrar para subir tu hoja."
          action={backToPractice}
        />
      ) : (
        <EmptyState
          kind="error"
          title="No pudimos cargar el escáner"
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
    content = <ScanFlow studentId={me.data.profileId} />;
  }

  return (
    <div className="mx-auto max-w-[640px]" data-testid="scan-root">
      <Link href="/practice" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
        ← Mi práctica
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--fg-1)]">
        Escanear guía realizada
      </h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Fotografía tus hojas resueltas — puedes subir varias páginas en una sola sesión.
      </p>
      <div className="mt-6">{content}</div>
    </div>
  );
}
