import type { GuideStatus, GuideQuestionStatus, SubmissionStatus } from '@innova/api-client';

interface BadgeStyle {
  readonly label: string;
  readonly cls: string;
}

const GUIDE_STATUS: Record<GuideStatus, BadgeStyle> = {
  UPLOADED: { label: 'Cargada', cls: 'bg-[var(--surface-2)] text-[var(--fg-2)]' },
  EXTRACTING: { label: 'Extrayendo…', cls: 'bg-[var(--info-bg)] text-[var(--info-fg)]' },
  EXTRACTION_FAILED: { label: 'Falló extracción', cls: 'bg-danger/15 text-danger' },
  GENERATING_SOLUTIONS: {
    label: 'Generando pauta…',
    cls: 'bg-[var(--info-bg)] text-[var(--info-fg)]',
  },
  GENERATION_FAILED: { label: 'Falló pauta', cls: 'bg-danger/15 text-danger' },
  REVIEW: { label: 'Por revisar', cls: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' },
  PUBLISHED: { label: 'Publicada', cls: 'bg-[var(--success-bg)] text-[var(--success-fg)]' },
  ARCHIVED: { label: 'Archivada', cls: 'bg-[var(--surface-2)] text-[var(--fg-3)]' },
};

const QUESTION_STATUS: Record<GuideQuestionStatus, BadgeStyle> = {
  EXTRACTED: { label: 'Extraída', cls: 'bg-[var(--surface-2)] text-[var(--fg-2)]' },
  NEEDS_REVIEW: { label: 'Por revisar', cls: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' },
  APPROVED: { label: 'Aprobada', cls: 'bg-[var(--success-bg)] text-[var(--success-fg)]' },
  EXCLUDED: { label: 'Excluida', cls: 'bg-[var(--surface-2)] text-[var(--fg-3)] line-through' },
};

const SUBMISSION_STATUS: Record<SubmissionStatus, BadgeStyle> = {
  UPLOADED: { label: 'Enviada', cls: 'bg-[var(--surface-2)] text-[var(--fg-2)]' },
  TRANSCRIBING: { label: 'Leyendo…', cls: 'bg-[var(--info-bg)] text-[var(--info-fg)]' },
  GRADING: { label: 'Corrigiendo…', cls: 'bg-[var(--info-bg)] text-[var(--info-fg)]' },
  GRADED: { label: 'Corregida', cls: 'bg-[var(--success-bg)] text-[var(--success-fg)]' },
  FAILED: { label: 'Error', cls: 'bg-danger/15 text-danger' },
};

function Pill({ style }: { style: BadgeStyle }): JSX.Element {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${style.cls}`}>
      {style.label}
    </span>
  );
}

export function GuideStatusBadge({ status }: { status: GuideStatus }): JSX.Element {
  return <Pill style={GUIDE_STATUS[status]} />;
}

export function QuestionStatusBadge({ status }: { status: GuideQuestionStatus }): JSX.Element {
  return <Pill style={QUESTION_STATUS[status]} />;
}

export function SubmissionStateChip({ status }: { status: SubmissionStatus }): JSX.Element {
  return <Pill style={SUBMISSION_STATUS[status]} />;
}

export const GUIDE_STATUS_LABEL: Record<GuideStatus, string> = Object.fromEntries(
  Object.entries(GUIDE_STATUS).map(([k, v]) => [k, v.label])
) as Record<GuideStatus, string>;

/** True while the pipeline is actively working (poll the detail view). */
export function isGuideWorking(status: GuideStatus): boolean {
  return status === 'UPLOADED' || status === 'EXTRACTING' || status === 'GENERATING_SOLUTIONS';
}

export function isGuideFailed(status: GuideStatus): boolean {
  return status === 'EXTRACTION_FAILED' || status === 'GENERATION_FAILED';
}
