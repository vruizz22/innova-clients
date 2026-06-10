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
// GET /auth/me → { id, email, role } (id = User.id / prismaUserId)
export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
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
