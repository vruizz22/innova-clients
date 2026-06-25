import { ErrorCatalogExplorer } from '@/components/teacher/ErrorCatalogExplorer';

export const dynamic = 'force-dynamic';

export default function ErrorSearchPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-[820px]" data-testid="error-search-root">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">
        Catálogo de errores
      </h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        Busca por nombre en español o código. Identifica patrones de error en tus alumnos y
        selecciona el error correcto al revisar un intento.
      </p>
      <div className="mt-6">
        <ErrorCatalogExplorer />
      </div>
    </div>
  );
}
