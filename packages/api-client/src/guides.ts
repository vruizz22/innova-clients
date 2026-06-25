import { z } from 'zod';

/**
 * v9 guide pipeline schemas (innova-backend-serverless `guides` +
 * `guide-submissions` modules). Dates cross the wire as ISO strings. Schemas
 * validate the subset the frontend consumes; unknown fields are stripped.
 */

// ----------------------------------------------------------------- enums ----
export const guideStatusSchema = z.enum([
  'UPLOADED',
  'EXTRACTING',
  'EXTRACTION_FAILED',
  'GENERATING_SOLUTIONS',
  'GENERATION_FAILED',
  'REVIEW',
  'PUBLISHED',
  'ARCHIVED',
]);
export type GuideStatus = z.infer<typeof guideStatusSchema>;

export const guideQuestionStatusSchema = z.enum([
  'EXTRACTED',
  'NEEDS_REVIEW',
  'APPROVED',
  'EXCLUDED',
]);
export type GuideQuestionStatus = z.infer<typeof guideQuestionStatusSchema>;

export const solutionSourceSchema = z.enum(['PDF_PROVIDED', 'LLM_GENERATED', 'TEACHER_EDITED']);
export type SolutionSource = z.infer<typeof solutionSourceSchema>;

// ----------------------------------------------- canonical solution (ADR-118) ----
export const solutionStepSchema = z.object({
  idx: z.number(),
  latex: z.string(),
  explanation_es: z.string().optional(),
  rule: z.string().optional(),
  checkpoint: z.boolean().optional(),
  expected_error_tags: z.array(z.string()).optional(),
});
export type SolutionStep = z.infer<typeof solutionStepSchema>;

export const altPathSchema = z.object({
  label: z.string(),
  steps: z.array(solutionStepSchema),
});

export const canonicalSolutionSchema = z.object({
  final_answer: z.string(),
  points: z.number().optional(),
  steps: z.array(solutionStepSchema),
  alt_paths: z.array(altPathSchema).optional(),
});
export type CanonicalSolution = z.infer<typeof canonicalSolutionSchema>;

// ------------------------------------------------------------- guide create ----
export interface CreateGuideInput {
  readonly courseId: string;
  readonly title: string;
  readonly description?: string;
  readonly fileName?: string;
  readonly dueAt?: string;
}
export const createGuideResultSchema = z.object({
  guideId: z.string(),
  presignedPutUrl: z.string(),
  sourcePdfKey: z.string(),
});
export type CreateGuideResult = z.infer<typeof createGuideResultSchema>;

export const ingestResultSchema = z.object({ status: guideStatusSchema });
export type IngestResult = z.infer<typeof ingestResultSchema>;

// --------------------------------------------------------------- guide list ----
export const guideListItemSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: guideStatusSchema,
  questionCount: z.number(),
  failureReason: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  _count: z.object({ questions: z.number(), submissions: z.number() }).optional(),
});
export type GuideListItem = z.infer<typeof guideListItemSchema>;

export const guidesListSchema = z.object({
  items: z.array(guideListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type GuidesList = z.infer<typeof guidesListSchema>;

// ------------------------------------------------------------- guide detail ----
/** A {id, code, name} reference to a curriculum topic or a taxonomy domain/subdomain. */
export const taxonomyRefSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});
export type TaxonomyRef = z.infer<typeof taxonomyRefSchema>;

export const guideSolutionSchema = z.object({
  id: z.string(),
  version: z.number(),
  isCurrent: z.boolean(),
  source: solutionSourceSchema,
  finalAnswer: z.string(),
  stepsJson: canonicalSolutionSchema,
  solutionLatex: z.string().nullable().optional(),
  expectedErrorTags: z.array(z.string()),
  validationNotes: z.string().nullable().optional(),
});
export type GuideSolution = z.infer<typeof guideSolutionSchema>;

export const guideQuestionSchema = z.object({
  id: z.string(),
  sequence: z.number(),
  label: z.string().nullable(),
  statementLatex: z.string(),
  figureKeys: z.array(z.string()),
  providedAnswer: z.string().nullable().optional(),
  providedSolutionLatex: z.string().nullable().optional(),
  points: z.number(),
  status: guideQuestionStatusSchema,
  topicId: z.string().nullable(),
  topicConfidence: z.number().nullable().optional(),
  topicSource: z.string().nullable().optional(),
  topic: taxonomyRefSchema.nullable().optional(),
  // Taxonomy classification (domain/subdomain) — the primary topic shown in the
  // wizard since v9.1; derived from the error catalog, not the curriculum topics.
  domain: taxonomyRefSchema.nullable().optional(),
  subdomain: taxonomyRefSchema.nullable().optional(),
  solutions: z.array(guideSolutionSchema),
});
export type GuideQuestion = z.infer<typeof guideQuestionSchema>;

export const guideDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: guideStatusSchema,
  questionCount: z.number(),
  maxResubmissions: z.number(),
  showSolutionAfterGrade: z.boolean(),
  dueAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  failureReason: z.string().nullable().optional(),
  questions: z.array(guideQuestionSchema),
});
export type GuideDetail = z.infer<typeof guideDetailSchema>;

// ------------------------------------------------------------- mutations ----
export interface UpdateGuideInput {
  readonly title?: string;
  readonly description?: string;
  readonly dueAt?: string;
  readonly maxResubmissions?: number;
  readonly showSolutionAfterGrade?: boolean;
}

export interface UpdateGuideQuestionInput {
  readonly statementLatex?: string;
  readonly label?: string;
  readonly points?: number;
  readonly topicId?: string;
  readonly subdomainId?: string;
  readonly status?: 'APPROVED' | 'EXCLUDED';
}

// ----------------------------------------------------------- taxonomy ----
/** GET /skills/taxonomy → domains, each with its subdomains (classification catalog). */
export const taxonomyDomainSchema = taxonomyRefSchema.extend({
  subdomains: z.array(taxonomyRefSchema),
});
export const taxonomySchema = z.array(taxonomyDomainSchema);
export type TaxonomyDomain = z.infer<typeof taxonomyDomainSchema>;

/** GET /skills/error-tags → live ACTIVE catalog matches for the manual-override typeahead. */
export const catalogErrorSchema = z.object({
  code: z.string(),
  name: z.string().nullable(),
  subdomainCode: z.string().nullable(),
  domainCode: z.string().nullable(),
});
export const catalogErrorListSchema = z.array(catalogErrorSchema);
export type CatalogError = z.infer<typeof catalogErrorSchema>;
export interface SearchCatalogErrorsInput {
  readonly q?: string;
  readonly domainCode?: string;
  readonly limit?: number;
}

export interface UpdateGuideSolutionInput {
  readonly finalAnswer: string;
  readonly stepsJson: CanonicalSolution;
  readonly solutionLatex?: string;
  readonly expectedErrorTags?: readonly string[];
}

export const guideSchema = z.object({
  id: z.string(),
  status: guideStatusSchema,
  title: z.string(),
});
export type Guide = z.infer<typeof guideSchema>;

export const guideSourceUrlSchema = z.object({ url: z.string() });
export type GuideSourceUrl = z.infer<typeof guideSourceUrlSchema>;

export const guideQuestionAckSchema = z.object({
  id: z.string(),
  status: guideQuestionStatusSchema,
});
export const solutionAckSchema = z.object({ id: z.string(), version: z.number() });

export const enqueueResultSchema = z.object({ enqueued: z.boolean() });

export const publishResultSchema = z.object({
  assignmentId: z.string(),
  materializedExercises: z.number(),
  approvedWithoutTopic: z.number(),
  studentsAssigned: z.number(),
});
export type PublishResult = z.infer<typeof publishResultSchema>;

// --------------------------------------------------------- student: quiz ----
export const studentGuideListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dueAt: z.string().nullable(),
  totalQuestions: z.number(),
  gradedQuestions: z.number(),
});
export const studentGuidesSchema = z.array(studentGuideListItemSchema);
export type StudentGuideListItem = z.infer<typeof studentGuideListItemSchema>;

export const submissionStatusSchema = z.enum([
  'UPLOADED',
  'TRANSCRIBING',
  'GRADING',
  'GRADED',
  'FAILED',
]);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

export const quizSubmissionSchema = z.object({
  id: z.string(),
  guideQuestionId: z.string(),
  attemptNumber: z.number(),
  status: submissionStatusSchema,
  score: z.number().nullable(),
  isCorrect: z.boolean().nullable(),
  gradedAt: z.string().nullable(),
});
export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;

export const quizQuestionSchema = z.object({
  id: z.string(),
  sequence: z.number(),
  label: z.string().nullable(),
  statementLatex: z.string(),
  figureKeys: z.array(z.string()),
  points: z.number(),
  submissions: z.array(quizSubmissionSchema),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizSchema = z.object({
  guide: z.object({
    id: z.string(),
    title: z.string(),
    dueAt: z.string().nullable(),
    maxResubmissions: z.number(),
  }),
  questions: z.array(quizQuestionSchema),
});
export type Quiz = z.infer<typeof quizSchema>;

export interface CreateSubmissionInput {
  readonly photoCount: number;
}
export const createSubmissionResultSchema = z.object({
  submissionId: z.string(),
  presignedPutUrls: z.array(z.string()),
  attemptNumber: z.number(),
});
export type CreateSubmissionResult = z.infer<typeof createSubmissionResultSchema>;

export const completeResultSchema = z.object({ status: z.string() });

export const submissionStatusResultSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  score: z.number().nullable(),
  isCorrect: z.boolean().nullable(),
  errorTagCode: z.string().nullable(),
  errorTagName: z.string().nullable(),
  diagnosticHint: z.string().nullable(),
  gradedAt: z.string().nullable(),
});
export type SubmissionStatusResult = z.infer<typeof submissionStatusResultSchema>;

// ----------------------------------------------------- student: results ----
export const guideResultQuestionSchema = z.object({
  questionId: z.string(),
  sequence: z.number(),
  label: z.string().nullable(),
  points: z.number(),
  status: z.string(),
  score: z.number().nullable(),
  isCorrect: z.boolean().nullable(),
  errorTagCode: z.string().nullable(),
  // nullish (not nullable) so the schema tolerates the rollout window before
  // the backend Fase A ships this field; tighten to .nullable() post-deploy.
  errorTagName: z.string().nullish(),
  solution: guideSolutionSchema.nullable(),
});
export const guideResultsSchema = z.object({
  guideId: z.string(),
  showSolution: z.boolean(),
  questions: z.array(guideResultQuestionSchema),
});
export type GuideResults = z.infer<typeof guideResultsSchema>;

// ---------------------------------------------- teacher: results matrix ----
export const matrixStudentSchema = z.object({
  id: z.string(),
  displayName: z.string(),
});
export const matrixQuestionSchema = z.object({
  id: z.string(),
  sequence: z.number(),
  label: z.string().nullable(),
  points: z.number(),
});
export const matrixCellSchema = z.object({
  submissionId: z.string(),
  questionId: z.string(),
  studentId: z.string(),
  status: submissionStatusSchema,
  score: z.number().nullable(),
  isCorrect: z.boolean().nullable(),
  attemptNumber: z.number(),
  errorTagCode: z.string().nullable(),
  errorTagName: z.string().nullable(),
  isOverridden: z.boolean(),
  isLate: z.boolean(),
});
export const matrixCommonErrorSchema = z.object({
  questionId: z.string(),
  tags: z.array(
    z.object({
      code: z.string(),
      name: z.string().nullable(),
      count: z.number(),
    })
  ),
});
export const guideResultsMatrixSchema = z.object({
  guideId: z.string(),
  dueAt: z.string().nullable(),
  students: z.array(matrixStudentSchema),
  questions: z.array(matrixQuestionSchema),
  cells: z.array(matrixCellSchema),
  commonErrors: z.array(matrixCommonErrorSchema),
});
export type GuideResultsMatrix = z.infer<typeof guideResultsMatrixSchema>;
export type MatrixCell = z.infer<typeof matrixCellSchema>;

// Alignment is pipeline-emitted JSON (student step ↔ pauta checkpoint + verdict).
// Permissive: the worker's exact shape isn't pinned here, so unknown extras pass.
export const alignmentStepSchema = z
  .object({
    studentStepIdx: z.number().optional(),
    studentLatex: z.string().optional(),
    checkpointIdx: z.number().optional(),
    verdict: z.string().optional(),
    note: z.string().optional(),
  })
  .passthrough();
export const submissionDetailSchema = z.object({
  submissionId: z.string(),
  questionSequence: z.number(),
  questionLabel: z.string().nullable(),
  statementLatex: z.string(),
  status: submissionStatusSchema,
  score: z.number().nullable(),
  isCorrect: z.boolean().nullable(),
  attemptNumber: z.number(),
  transcriptionLatex: z.string().nullable(),
  transcriptionConfidence: z.number().nullable(),
  alignmentJson: z.array(alignmentStepSchema).nullable().catch(null),
  failureReason: z.string().nullable(),
  photoUrls: z.array(z.string()),
  errorTagCode: z.string().nullable(),
  errorTagName: z.string().nullable(),
  isOverridden: z.boolean(),
});
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;
export type AlignmentStep = z.infer<typeof alignmentStepSchema>;

export interface OverrideSubmissionErrorInput {
  /** Catalog code, or null to clear the override. */
  readonly errorTagCode: string | null;
}
export const overrideErrorAckSchema = z.object({
  submissionId: z.string(),
  errorTagCode: z.string().nullable(),
  errorTagName: z.string().nullable(),
  isOverridden: z.boolean(),
});
export type OverrideErrorAck = z.infer<typeof overrideErrorAckSchema>;

// -------------------------------------------------- scan-page (endpoint #7) --

/** Response from GET /student/guides/:id/scan-page-url */
export const scanPageUploadUrlSchema = z.object({
  photoKey: z.string(),
  presignedUrl: z.string(),
});
export type ScanPageUploadUrl = z.infer<typeof scanPageUploadUrlSchema>;

/** One question matched/skipped in the scan-page response. */
export const scanPageSubmissionSchema = z.object({
  questionId: z.string(),
  sequence: z.number(),
  submissionId: z.string().nullable(),
  skipped: z.boolean(),
  reason: z.string().optional(),
});
export type ScanPageSubmission = z.infer<typeof scanPageSubmissionSchema>;

/** Response from POST /student/guides/:id/scan-page */
export const scanPageResultSchema = z.object({
  photoKey: z.string(),
  matched: z.number(),
  submissions: z.array(scanPageSubmissionSchema),
});
export type ScanPageResult = z.infer<typeof scanPageResultSchema>;
