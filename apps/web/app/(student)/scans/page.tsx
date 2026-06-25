import Link from 'next/link';
import { CameraIcon } from '@innova/ui';
import { ScanHistoryList } from '@/components/practice/ScanHistoryList';

export const dynamic = 'force-dynamic';

export default function ScansPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-[640px]" data-testid="scans-root">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">Mis escaneos</h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Tus guías escaneadas y prácticas anteriores.
          </p>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <CameraIcon size={16} />
          Escanear
        </Link>
      </div>

      <ScanHistoryList />
    </div>
  );
}
