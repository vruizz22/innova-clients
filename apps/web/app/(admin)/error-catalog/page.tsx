import { EmptyState } from '@innova/ui';
import { getServerApi } from '@/lib/api.server';
import { AdminErrorCatalogClient } from '@/components/admin/AdminErrorCatalogClient';

export const dynamic = 'force-dynamic';

export default async function AdminErrorCatalogPage(): Promise<JSX.Element> {
  const api = getServerApi();
  const res = await api.listErrorTags({ limit: 50 });

  if (!res.ok) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">
          Catálogo de errores
        </h1>
        <EmptyState
          kind="error"
          title="No se pudo cargar el catálogo"
          body="Hubo un problema al conectar con el backend. Intenta de nuevo en un momento."
          className="mt-6"
        />
      </div>
    );
  }

  return <AdminErrorCatalogClient initial={res.data} />;
}
