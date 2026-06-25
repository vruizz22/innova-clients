'use client';

import { useState, useCallback } from 'react';
import { Card, CheckIcon, XIcon, ImageLightbox } from '@innova/ui';
import { formatHumanName } from '@innova/error-catalog';
import { getBrowserApi } from '@/lib/api.client';
import { Latex } from '@/components/latex/Latex';
import type { AttemptDetail } from '@innova/api-client';

interface AttemptRow {
  readonly id: string;
  readonly exercisePrompt: string;
  readonly isCorrect: boolean;
  readonly errorTagCode: string | null;
  /** es-CL catalog name; preferred over humanizing the code. */
  readonly errorTagName?: string | null;
}

/** Best available transcription of an attempt for the list/detail header. */
function attemptLabel(detail: AttemptDetail): string {
  return (
    detail.submission?.transcriptionLatex ??
    detail.steps.map((s) => s.contentLatex).find((c) => c.trim().length > 0) ??
    ''
  );
}

interface Props {
  readonly attempts: AttemptRow[];
}

interface DetailState {
  readonly open: boolean;
  readonly loading: boolean;
  readonly data: AttemptDetail | null;
  readonly lightboxSrc: string | null;
}

const INIT: DetailState = { open: false, loading: false, data: null, lightboxSrc: null };

export function AttemptDetailPanel({ attempts }: Props): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailState>(INIT);

  const open = useCallback(async (attemptId: string) => {
    setSelected(attemptId);
    setDetail({ open: true, loading: true, data: null, lightboxSrc: null });

    const result = await getBrowserApi().getAttemptDetail(attemptId);
    if (result.ok) {
      setDetail({ open: true, loading: false, data: result.data, lightboxSrc: null });
    } else {
      setDetail({ open: true, loading: false, data: null, lightboxSrc: null });
    }
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    setDetail(INIT);
  }, []);

  const openPhoto = useCallback((src: string) => {
    setDetail((prev) => ({ ...prev, lightboxSrc: src }));
  }, []);

  const closePhoto = useCallback(() => {
    setDetail((prev) => ({ ...prev, lightboxSrc: null }));
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2">
        {attempts.length === 0 ? (
          <p className="text-sm text-[var(--fg-3)]">Sin intentos registrados todavía.</p>
        ) : null}
        {attempts.slice(0, 12).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => void open(a.id)}
            className={[
              'w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-card)] transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-pop)] active:scale-[0.97]',
              selected === a.id ? 'ring-2 ring-[var(--primary)]/40' : '',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                {a.exercisePrompt ? (
                  <Latex className="block truncate text-sm text-[var(--fg-1)]">
                    {a.exercisePrompt}
                  </Latex>
                ) : (
                  <p className="truncate text-sm italic text-[var(--fg-3)]">
                    Toca para ver el desarrollo
                  </p>
                )}
              </div>
              <span
                className={[
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
                  a.isCorrect
                    ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
                    : !a.errorTagCode || a.errorTagCode === 'UNCLASSIFIED'
                      ? 'bg-[var(--surface-2)] text-[var(--fg-2)]'
                      : 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
                ].join(' ')}
              >
                {a.isCorrect ? (
                  <CheckIcon size={13} strokeWidth={2.5} />
                ) : !a.errorTagCode || a.errorTagCode === 'UNCLASSIFIED' ? (
                  'Pendiente'
                ) : (
                  (a.errorTagName ?? formatHumanName(a.errorTagCode))
                )}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--fg-3)]">Toca para ver la transcripción</p>
          </button>
        ))}
      </div>

      {/* ─── detail panel ─────────────────────────────────────────────────── */}
      {detail.open ? (
        <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[480px] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-base font-bold text-[var(--fg-1)]">Detalle del intento</h3>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--fg-2)] transition-colors hover:bg-[var(--border)]"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {detail.loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--surface-2)]" />
                ))}
              </div>
            ) : !detail.data ? (
              <p className="text-sm text-[var(--fg-3)]">
                No se pudo cargar el detalle. Verifica que el backend está desplegado.
              </p>
            ) : (
              <>
                {/* ── transcripción + clasificación ── */}
                <div className="mb-5">
                  {attemptLabel(detail.data) ? (
                    <Latex className="block text-base text-[var(--fg-1)]">
                      {attemptLabel(detail.data)}
                    </Latex>
                  ) : null}
                  <div className="mt-2">
                    {detail.data.isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-bold text-[var(--success-fg)]">
                        <CheckIcon size={13} strokeWidth={2.5} /> Correcto
                      </span>
                    ) : detail.data.errorTagCode && detail.data.errorTagCode !== 'UNCLASSIFIED' ? (
                      <span className="inline-flex items-center rounded-full bg-[var(--warning-bg)] px-3 py-1 text-xs font-bold text-[var(--warning-fg)]">
                        {detail.data.errorTagName ?? formatHumanName(detail.data.errorTagCode)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold text-[var(--fg-2)]">
                        Pendiente de clasificación
                      </span>
                    )}
                  </div>
                </div>

                {/* ── steps ── */}
                {detail.data.steps.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                      Pasos ({detail.data.steps.length})
                    </p>
                    {detail.data.steps.map((s) => (
                      <Card key={s.stepIndex}>
                        <div className="flex items-start gap-3">
                          <span
                            className={[
                              'mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold',
                              s.isCorrect === true
                                ? 'bg-[var(--success-bg)] text-[var(--success-fg)]'
                                : s.isCorrect === false
                                  ? 'bg-[var(--error-bg)] text-[var(--error-fg)]'
                                  : 'bg-[var(--surface-2)] text-[var(--fg-3)]',
                            ].join(' ')}
                          >
                            {s.stepIndex + 1}
                          </span>
                          <Latex className="min-w-0 break-words text-sm text-[var(--fg-1)]">
                            {s.contentLatex}
                          </Latex>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--fg-3)]">Sin pasos registrados.</p>
                )}

                {/* ── submission photos ── */}
                {detail.data.submission?.photoUrls && detail.data.submission.photoUrls.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">
                      Fotos del envío ({detail.data.submission.photoUrls.length})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {detail.data.submission.photoUrls.map((url, i) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => openPhoto(url)}
                          className="sp-lift overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
                          aria-label={`Ampliar foto ${i + 1}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Foto ${i + 1}`}
                            className="h-24 w-24 object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      <ImageLightbox
        open={detail.lightboxSrc !== null}
        src={detail.lightboxSrc}
        onClose={closePhoto}
      />
    </>
  );
}
