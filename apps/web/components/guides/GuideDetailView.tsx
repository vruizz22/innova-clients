'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GuideStatus } from '@innova/api-client';
import { CheckIcon, XIcon } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import { GuideStatusBadge, isGuideFailed, isGuideWorking } from './status';

export interface GuideDetailViewProps {
  readonly guideId: string;
  readonly title: string;
  readonly initialStatus: GuideStatus;
  readonly initialFailureReason: string | null;
  readonly questionCount: number;
}

// Linear pipeline the timeline renders. Failure states branch off (handled below).
const TIMELINE: ReadonlyArray<{ readonly key: GuideStatus; readonly label: string }> = [
  { key: 'UPLOADED', label: 'PDF cargado' },
  { key: 'EXTRACTING', label: 'Leyendo el PDF' },
  { key: 'GENERATING_SOLUTIONS', label: 'Generando la pauta' },
  { key: 'REVIEW', label: 'Listo para revisar' },
  { key: 'PUBLISHED', label: 'Publicada' },
];

function stageIndex(status: GuideStatus): number {
  if (status === 'EXTRACTION_FAILED') return 1;
  if (status === 'GENERATION_FAILED') return 2;
  const i = TIMELINE.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export function GuideDetailView({
  guideId,
  title,
  initialStatus,
  initialFailureReason,
  questionCount,
}: GuideDetailViewProps): JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<GuideStatus>(initialStatus);
  const [failureReason, setFailureReason] = useState<string | null>(initialFailureReason);
  const [retrying, setRetrying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll while the pipeline is working; stop as soon as it settles.
  useEffect(() => {
    if (!isGuideWorking(status)) return;
    const api = getBrowserApi();
    timer.current = setInterval(async () => {
      const res = await api.getGuide(guideId);
      if (res.ok) {
        setStatus(res.data.status);
        setFailureReason(res.data.failureReason ?? null);
        if (!isGuideWorking(res.data.status)) router.refresh();
      }
    }, 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [guideId, status, router]);

  const [pdfBusy, setPdfBusy] = useState(false);

  const retry = useCallback(async (): Promise<void> => {
    setRetrying(true);
    const res = await getBrowserApi().ingestGuide(guideId);
    setRetrying(false);
    if (res.ok) setStatus(res.data.status);
  }, [guideId]);

  const openPdf = useCallback(async (): Promise<void> => {
    setPdfBusy(true);
    const res = await getBrowserApi().getGuideSourceUrl(guideId);
    setPdfBusy(false);
    if (res.ok) window.open(res.data.url, '_blank', 'noopener,noreferrer');
  }, [guideId]);

  const current = stageIndex(status);
  const failed = isGuideFailed(status);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">{title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void openPdf()}
            disabled={pdfBusy}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--fg-2)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
          >
            {pdfBusy ? 'Cargando…' : 'Ver PDF ↗'}
          </button>
          <GuideStatusBadge status={status} />
        </div>
      </div>

      <ol className="sp-stagger flex flex-col gap-3">
        {TIMELINE.map((stage, i) => {
          const done = i < current;
          const active = i === current && !failed;
          const failedHere = failed && i === current;
          return (
            <li key={stage.key} className="flex items-center gap-3">
              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                  failedHere
                    ? 'bg-danger text-white'
                    : done
                    ? 'bg-mint-500 text-white'
                    : active
                    ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                    : 'bg-[var(--surface-2)] text-[var(--fg-2)]',
                ].join(' ')}
              >
                {failedHere ? (
                  <XIcon size={14} strokeWidth={2.5} />
                ) : done ? (
                  <CheckIcon size={14} strokeWidth={2.5} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={[
                  'text-sm',
                  active
                    ? 'font-bold text-[var(--fg-1)]'
                    : done
                    ? 'text-[var(--fg-2)]'
                    : 'text-[var(--fg-3)]',
                ].join(' ')}
              >
                {stage.label}
                {active && isGuideWorking(status) ? ' …' : ''}
              </span>
            </li>
          );
        })}
      </ol>

      {failed ? (
        <div className="rounded-xl bg-danger/10 px-4 py-3">
          <p className="text-sm font-bold text-danger">No pudimos procesar la guía</p>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            {failureReason ?? 'Revisa que el PDF esté nítido (300 dpi) y vuelve a intentar.'}
          </p>
          <button
            type="button"
            onClick={() => void retry()}
            disabled={retrying}
            className="mt-3 rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {retrying ? 'Reintentando…' : 'Reintentar'}
          </button>
        </div>
      ) : null}

      {status === 'REVIEW' ? (
        <Link
          href={`/guides/${guideId}/review`}
          className="rounded-xl bg-[var(--primary)] px-5 py-3 text-center text-base font-bold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
        >
          Revisar pauta ({questionCount} pregunta{questionCount === 1 ? '' : 's'}) →
        </Link>
      ) : null}

      {status === 'PUBLISHED' ? (
        <Link
          href={`/guides/${guideId}/results`}
          className="rounded-xl bg-mint-500 px-5 py-3 text-center text-base font-bold text-white hover:bg-mint-600"
        >
          Ver resultados →
        </Link>
      ) : null}

      {isGuideWorking(status) ? (
        <p className="text-center text-xs text-[var(--fg-3)]">
          Esto puede tardar un par de minutos. Puedes salir y volver; seguirá procesando.
        </p>
      ) : null}
    </div>
  );
}
