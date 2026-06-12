import type { GuideStatus, GuideQuestionStatus, SubmissionStatus } from '@innova/api-client';

interface BadgeStyle {
  readonly label: string;
  readonly cls: string;
}

const GUIDE_STATUS: Record<GuideStatus, BadgeStyle> = {
  UPLOADED: { label: 'Cargada', cls: 'bg-slate-100 text-slate-600' },
  EXTRACTING: { label: 'Extrayendo…', cls: 'bg-sky-100 text-sky-700' },
  EXTRACTION_FAILED: { label: 'Falló extracción', cls: 'bg-rose-100 text-rose-700' },
  GENERATING_SOLUTIONS: { label: 'Generando pauta…', cls: 'bg-sky-100 text-sky-700' },
  GENERATION_FAILED: { label: 'Falló pauta', cls: 'bg-rose-100 text-rose-700' },
  REVIEW: { label: 'Por revisar', cls: 'bg-amber-100 text-amber-800' },
  PUBLISHED: { label: 'Publicada', cls: 'bg-emerald-100 text-emerald-700' },
  ARCHIVED: { label: 'Archivada', cls: 'bg-slate-100 text-slate-400' },
};

const QUESTION_STATUS: Record<GuideQuestionStatus, BadgeStyle> = {
  EXTRACTED: { label: 'Extraída', cls: 'bg-slate-100 text-slate-600' },
  NEEDS_REVIEW: { label: 'Por revisar', cls: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Aprobada', cls: 'bg-emerald-100 text-emerald-700' },
  EXCLUDED: { label: 'Excluida', cls: 'bg-slate-100 text-slate-400 line-through' },
};

const SUBMISSION_STATUS: Record<SubmissionStatus, BadgeStyle> = {
  UPLOADED: { label: 'Enviada', cls: 'bg-slate-100 text-slate-600' },
  TRANSCRIBING: { label: 'Leyendo…', cls: 'bg-sky-100 text-sky-700' },
  GRADING: { label: 'Corrigiendo…', cls: 'bg-sky-100 text-sky-700' },
  GRADED: { label: 'Corregida', cls: 'bg-emerald-100 text-emerald-700' },
  FAILED: { label: 'Error', cls: 'bg-rose-100 text-rose-700' },
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
