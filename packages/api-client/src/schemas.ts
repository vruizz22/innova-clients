import { z } from 'zod';

/**
 * Response schemas mirroring the live NestJS backend surface (innova-backend-serverless).
 * Each schema validates the subset of fields the frontend consumes; unknown extra
 * fields are stripped. When the backend exposes `/docs-json`, these can be checked
 * against (or regenerated from) the OpenAPI document with `openapi-typescript`.
 */

// ---------------------------------------------------------------- shared ----
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof difficultySchema>;

// ------------------------------------------------------------------ auth ----
// GET /auth/me → { id, email, role, profileId }
//   id        = User.id (prismaUserId)
//   profileId = role-specific record id (Student.id / Teacher.id / Parent.id),
//               null until the role profile exists. This is the id domain
//               endpoints expect (e.g. /assignments/student/:studentId).
export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  profileId: z.string().nullable(),
});
export type Me = z.infer<typeof meSchema>;

// ------------------------------------------------ exercises / assignments ----
const exerciseContentSchema = z.object({
  prompt: z.string().optional(),
  problem: z.string().optional(),
  expectedAnswer: z.union([z.number(), z.string(), z.null()]).optional(),
});

const topicLiteSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

const exerciseSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  content: exerciseContentSchema,
  irtA: z.number(),
  irtB: z.number(),
  status: z.string(),
  topic: topicLiteSchema,
});

const assignmentExerciseSchema = z.object({
  sequence: z.number(),
  exerciseId: z.string(),
  exercise: exerciseSchema,
});

const assignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  reason: z.string(),
  dueAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  assignmentExercises: z.array(assignmentExerciseSchema),
});

// GET /assignments/student/:id → AssignmentTarget[]
export const assignmentTargetSchema = z.object({
  assignmentId: z.string(),
  studentId: z.string(),
  status: z.string(),
  assignment: assignmentSchema,
});
export const studentAssignmentsSchema = z.array(assignmentTargetSchema);
export type StudentAssignment = z.infer<typeof assignmentTargetSchema>;

// ----------------------------------------------------------- topics ----
// GET /skills → Topic[] (the curriculum topic catalog, used by the guide wizard
// to confirm/change a question's topic).
export const topicCatalogEntrySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  unitId: z.string().nullable().optional(),
});
export const topicCatalogSchema = z.array(topicCatalogEntrySchema);
export type TopicCatalogEntry = z.infer<typeof topicCatalogEntrySchema>;

// ----------------------------------------------------------- classrooms ----
// GET /classrooms/mine → Course[]
export const classroomSchema = z.object({
  id: z.string(),
  name: z.string(),
  gradeLevel: z.number(),
  academicYear: z.number().optional(),
  subjectId: z.string().optional(),
  schoolId: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
});
export const classroomsSchema = z.array(classroomSchema);
export type Classroom = z.infer<typeof classroomSchema>;

// ----------------------------------------------------------------- items ----
// GET /items → ItemView[]
export const itemSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  topicCode: z.string(),
  topicName: z.string(),
  content: z.object({
    prompt: z.string(),
    problem: z.string().optional(),
    expectedAnswer: z.union([z.number(), z.string(), z.null()]).optional(),
  }),
  difficulty: difficultySchema,
  irtA: z.number(),
  irtB: z.number(),
});
export const itemsSchema = z.array(itemSchema);
export type Item = z.infer<typeof itemSchema>;

// --------------------------------------------------------------- mastery ----
const masteryTopicSchema = z.object({
  topicCode: z.string(),
  topicName: z.string(),
  pKnown: z.number(),
  attemptsCount: z.number(),
});

const attemptHistorySchema = z.object({
  id: z.string(),
  exercisePrompt: z.string(),
  isCorrect: z.boolean(),
  errorTagCode: z.string().nullable(),
  classifierSource: z.string(),
  confidence: z.number().nullable(),
  createdAt: z.string(),
});

const errorFrequencySchema = z.object({
  errorTagCode: z.string(),
  count: z.number(),
  percentage: z.number(),
});

// GET /mastery/classroom/:id → CourseStudentMasteryView[]
export const courseStudentMasterySchema = z.object({
  studentId: z.string(),
  displayName: z.string(),
  topics: z.array(masteryTopicSchema),
  attempts: z.array(attemptHistorySchema),
  errorFrequency: z.array(errorFrequencySchema),
});
export const classroomMasterySchema = z.array(courseStudentMasterySchema);
export type CourseStudentMastery = z.infer<typeof courseStudentMasterySchema>;

// GET /mastery/course/:id/heatmap → Student × Unit heatmap (C12)
export const heatmapUnitSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  sequence: z.number(),
});
export const heatmapStudentSchema = z.object({
  studentId: z.string(),
  displayName: z.string(),
  units: z.array(
    z.object({
      unitId: z.string(),
      pKnown: z.number(),
      topicCount: z.number(),
    })
  ),
  topics: z.array(
    z.object({
      topicId: z.string(),
      unitId: z.string(),
      topicCode: z.string(),
      topicName: z.string(),
      pKnown: z.number(),
    })
  ),
});
export const courseHeatmapSchema = z.object({
  courseId: z.string(),
  units: z.array(heatmapUnitSchema),
  students: z.array(heatmapStudentSchema),
});
export type CourseHeatmap = z.infer<typeof courseHeatmapSchema>;
export type HeatmapStudent = z.infer<typeof heatmapStudentSchema>;

// ---------------------------------------------------------------- parent ----
export const masteryBandSchema = z.enum(['low', 'mid', 'high']);
export type MasteryBand = z.infer<typeof masteryBandSchema>;

// GET /parent/children → ParentChild[]
export const parentChildSchema = z.object({
  studentId: z.string(),
  displayName: z.string(),
  relationship: z.string(),
});
export const parentChildrenSchema = z.array(parentChildSchema);
export type ParentChild = z.infer<typeof parentChildSchema>;

// GET /parent/children/:id → COPPA-safe summary (bands, no raw numbers)
export const parentChildSummarySchema = z.object({
  student: z.object({ id: z.string(), displayName: z.string() }),
  units: z.array(
    z.object({
      unitId: z.string(),
      code: z.string(),
      name: z.string(),
      band: masteryBandSchema,
    })
  ),
  recentGuides: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      dueAt: z.string().nullable(),
      gradedQuestions: z.number(),
      totalQuestions: z.number(),
    })
  ),
  alerts: z.array(
    z.object({
      id: z.string(),
      severity: z.string(),
      alertType: z.string(),
      createdAt: z.string(),
    })
  ),
});
export type ParentChildSummary = z.infer<typeof parentChildSummarySchema>;

// --------------------------------------------------------------- attempts ----
export const attemptStepSchema = z.object({
  expression: z.string(),
  isFinal: z.boolean(),
});
export type AttemptStep = z.infer<typeof attemptStepSchema>;

// POST /attempts → AttemptResponse
export const attemptResultSchema = z.object({
  attemptId: z.string(),
  isCorrect: z.boolean(),
  errorTagCode: z.string(),
  classifierSource: z.enum(['RULE', 'LLM']),
  confidence: z.number(),
});
export type AttemptResult = z.infer<typeof attemptResultSchema>;

/** Request body for POST /attempts (CreateAttemptDto). */
export interface CreateAttemptInput {
  readonly studentId: string;
  readonly topicCode: string;
  readonly exerciseId?: string;
  readonly courseId?: string;
  readonly rawSteps: ReadonlyArray<AttemptStep>;
  readonly expectedAnswer: number;
  readonly studentAnswer: number;
  readonly minuend?: number;
  readonly subtrahend?: number;
}

// POST /attempts/ocr-extract → OcrExtractResult
export const ocrExtractSchema = z.object({
  rawSteps: z.array(attemptStepSchema),
  finalAnswer: z.string(),
  topicHint: z.string().nullable(),
  confidence: z.number(),
});
export type OcrExtractResult = z.infer<typeof ocrExtractSchema>;

// ----------------------------------------------------- error report (C4) ----
/**
 * Request body for POST /attempts/:id/report — a student/teacher disagreeing with
 * the classifier picks the correct error tag from the catalog (v8 C4). The
 * resulting tag is recorded with ErrorSource.FIELD_REPORTED on the backend.
 */
export interface ReportAttemptErrorInput {
  readonly errorTagCode: string;
  readonly comment?: string;
}

// POST /attempts/:id/report → acknowledgement
export const reportAckSchema = z.object({
  attemptId: z.string(),
  reported: z.boolean(),
});
export type ReportAck = z.infer<typeof reportAckSchema>;

// ---------------------------------------------------------------- alerts ----
// GET /alerts?courseId= → TeacherAlert[]
export const alertSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  courseId: z.string(),
  topicId: z.string().nullable().optional(),
  studentId: z.string().nullable().optional(),
  alertType: z.string(),
  severity: z.string(),
  payload: z.unknown(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
});
export const alertsSchema = z.array(alertSchema);
export type Alert = z.infer<typeof alertSchema>;
