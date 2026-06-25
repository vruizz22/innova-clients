import { request, type ApiClientConfig, type ApiResult } from './http';
import {
  alertSchema,
  alertsSchema,
  attemptDetailSchema,
  attemptResultSchema,
  attemptStatusSchema,
  classroomMasterySchema,
  classroomSchema,
  classroomInviteSchema,
  classroomsSchema,
  courseHeatmapSchema,
  itemsSchema,
  meSchema,
  ocrExtractSchema,
  parentChildrenSchema,
  parentChildSummarySchema,
  recommendResultSchema,
  reportAckSchema,
  solveAdhocResultSchema,
  studentAssignmentsSchema,
  topicCatalogSchema,
  type Alert,
  type AssignPracticeInput,
  type AssignPracticeResult,
  type AttemptDetail,
  type AttemptResult,
  type AttemptStatus,
  type Classroom,
  type ClassroomInvite,
  type CreateClassroomInput,
  type JoinClassroomInput,
  type CourseHeatmap,
  type CourseStudentMastery,
  type CreateAttemptInput,
  type Item,
  type Me,
  type OcrExtractResult,
  type ParentChild,
  type ParentChildSummary,
  type RecommendResult,
  type ReportAck,
  type ReportAttemptErrorInput,
  type SolveAdhocInput,
  type SolveAdhocResult,
  type StudentAssignment,
  type TopicCatalogEntry,
  assignPracticeResultSchema,
  generateItemsResultSchema,
  type GenerateItemsInput,
  type GenerateItemsResult,
} from './schemas';
import {
  completeResultSchema,
  createGuideResultSchema,
  createSubmissionResultSchema,
  enqueueResultSchema,
  guideDetailSchema,
  guideQuestionAckSchema,
  guideSchema,
  guidesListSchema,
  guideResultsSchema,
  guideResultsMatrixSchema,
  overrideErrorAckSchema,
  submissionDetailSchema,
  ingestResultSchema,
  publishResultSchema,
  quizSchema,
  solutionAckSchema,
  studentGuidesSchema,
  submissionStatusResultSchema,
  taxonomySchema,
  catalogErrorListSchema,
  type CatalogError,
  type SearchCatalogErrorsInput,
  type CreateGuideInput,
  type CreateGuideResult,
  type CreateSubmissionInput,
  type CreateSubmissionResult,
  type GuideDetail,
  type GuideResults,
  type GuideResultsMatrix,
  type GuideStatus,
  type GuidesList,
  type OverrideErrorAck,
  type OverrideSubmissionErrorInput,
  type SubmissionDetail,
  type PublishResult,
  type Quiz,
  type StudentGuideListItem,
  type SubmissionStatusResult,
  type TaxonomyDomain,
  type UpdateGuideInput,
  type UpdateGuideQuestionInput,
  type UpdateGuideSolutionInput,
  scanPageUploadUrlSchema,
  scanPageResultSchema,
  guideSourceUrlSchema,
  type ScanPageUploadUrl,
  type ScanPageResult,
  type GuideSourceUrl,
} from './guides';
import {
  adminErrorTagSchema,
  adminErrorTagListSchema,
  adminStatusSchema,
  killswitchToggleResultSchema,
  type AdminErrorTag,
  type AdminErrorTagList,
  type AdminErrorTagSource,
  type AdminErrorTagStatus,
  type AdminStatus,
} from './admin';

export interface ListGuidesParams {
  readonly courseId?: string;
  readonly status?: GuideStatus;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ListItemsParams {
  readonly skillKey?: string;
  readonly topic?: string;
  readonly limit?: number;
}

export interface ListErrorTagsParams {
  readonly status?: AdminErrorTagStatus;
  /** Backend SHORT domain code (e.g. ARITH) — from the `domains` facet. */
  readonly domainCode?: string;
  readonly source?: AdminErrorTagSource;
  readonly q?: string;
  /** Keyset cursor: the `code` returned as `nextCursor`. */
  readonly cursor?: string;
  readonly limit?: number;
}

/** Typed facade over the Innova backend. Every method returns a Result. */
export interface InnovaApiClient {
  getMe(signal?: AbortSignal): Promise<ApiResult<Me>>;
  getStudentAssignments(
    studentId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<StudentAssignment[]>>;
  getMyClassrooms(signal?: AbortSignal): Promise<ApiResult<Classroom[]>>;
  createClassroom(
    input: CreateClassroomInput,
    signal?: AbortSignal
  ): Promise<ApiResult<Classroom>>;
  createClassroomInvite(
    courseId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<ClassroomInvite>>;
  joinClassroom(input: JoinClassroomInput, signal?: AbortSignal): Promise<ApiResult<Classroom>>;
  getClassroomMastery(
    classroomId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<CourseStudentMastery[]>>;
  getCourseHeatmap(courseId: string, signal?: AbortSignal): Promise<ApiResult<CourseHeatmap>>;
  listItems(params?: ListItemsParams, signal?: AbortSignal): Promise<ApiResult<Item[]>>;
  getAlerts(courseId: string, signal?: AbortSignal): Promise<ApiResult<Alert[]>>;
  resolveAlert(alertId: string, signal?: AbortSignal): Promise<ApiResult<Alert>>;
  listTopics(signal?: AbortSignal): Promise<ApiResult<TopicCatalogEntry[]>>;
  listTaxonomy(signal?: AbortSignal): Promise<ApiResult<TaxonomyDomain[]>>;
  searchCatalogErrors(
    params: SearchCatalogErrorsInput,
    signal?: AbortSignal
  ): Promise<ApiResult<CatalogError[]>>;

  // --- v9 parent (C12) ---
  listChildren(signal?: AbortSignal): Promise<ApiResult<ParentChild[]>>;
  getChildSummary(studentId: string, signal?: AbortSignal): Promise<ApiResult<ParentChildSummary>>;
  createAttempt(input: CreateAttemptInput, signal?: AbortSignal): Promise<ApiResult<AttemptResult>>;
  getAttemptStatus(
    attemptId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<AttemptStatus>>;
  ocrExtract(image: Blob, signal?: AbortSignal): Promise<ApiResult<OcrExtractResult>>;
  solveAdhoc(
    input: SolveAdhocInput,
    signal?: AbortSignal
  ): Promise<ApiResult<SolveAdhocResult>>;
  reportAttemptError(
    attemptId: string,
    input: ReportAttemptErrorInput,
    signal?: AbortSignal
  ): Promise<ApiResult<ReportAck>>;

  // --- v9 guides (teacher) ---
  listGuides(params?: ListGuidesParams, signal?: AbortSignal): Promise<ApiResult<GuidesList>>;
  getGuide(guideId: string, signal?: AbortSignal): Promise<ApiResult<GuideDetail>>;
  getGuideSourceUrl(guideId: string, signal?: AbortSignal): Promise<ApiResult<GuideSourceUrl>>;
  createGuide(input: CreateGuideInput, signal?: AbortSignal): Promise<ApiResult<CreateGuideResult>>;
  ingestGuide(guideId: string, signal?: AbortSignal): Promise<ApiResult<{ status: GuideStatus }>>;
  updateGuide(
    guideId: string,
    input: UpdateGuideInput,
    signal?: AbortSignal
  ): Promise<ApiResult<{ id: string; status: GuideStatus; title: string }>>;
  updateGuideQuestion(
    guideId: string,
    questionId: string,
    input: UpdateGuideQuestionInput,
    signal?: AbortSignal
  ): Promise<ApiResult<{ id: string; status: string }>>;
  updateGuideSolution(
    guideId: string,
    questionId: string,
    input: UpdateGuideSolutionInput,
    signal?: AbortSignal
  ): Promise<ApiResult<{ id: string; version: number }>>;
  regenerateSolution(
    guideId: string,
    questionId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<{ enqueued: boolean }>>;
  publishGuide(guideId: string, signal?: AbortSignal): Promise<ApiResult<PublishResult>>;
  archiveGuide(
    guideId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<{ id: string; status: GuideStatus; title: string }>>;

  // --- v9 guides (student) ---
  listStudentGuides(signal?: AbortSignal): Promise<ApiResult<StudentGuideListItem[]>>;
  getQuiz(guideId: string, signal?: AbortSignal): Promise<ApiResult<Quiz>>;
  createSubmission(
    guideId: string,
    questionId: string,
    input: CreateSubmissionInput,
    signal?: AbortSignal
  ): Promise<ApiResult<CreateSubmissionResult>>;
  completeSubmission(
    submissionId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<{ status: string }>>;
  getSubmissionStatus(
    submissionId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<SubmissionStatusResult>>;
  getGuideResults(guideId: string, signal?: AbortSignal): Promise<ApiResult<GuideResults>>;

  // --- scan-page: one photo → auto-split → N submissions (endpoint #7) ---
  getScanPageUploadUrl(
    guideId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<ScanPageUploadUrl>>;
  processScanPage(
    guideId: string,
    photoKey: string,
    signal?: AbortSignal
  ): Promise<ApiResult<ScanPageResult>>;

  // --- v9 guides (teacher results — C11) ---
  getGuideResultsMatrix(
    guideId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<GuideResultsMatrix>>;
  getSubmissionDetail(
    guideId: string,
    submissionId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<SubmissionDetail>>;
  overrideSubmissionError(
    guideId: string,
    submissionId: string,
    input: OverrideSubmissionErrorInput,
    signal?: AbortSignal
  ): Promise<ApiResult<OverrideErrorAck>>;

  // -- admin: live error-tag catalog ----------------------------------------
  listErrorTags(
    params?: ListErrorTagsParams,
    signal?: AbortSignal
  ): Promise<ApiResult<AdminErrorTagList>>;
  updateErrorTagStatus(
    code: string,
    status: AdminErrorTagStatus,
    signal?: AbortSignal
  ): Promise<ApiResult<AdminErrorTag>>;

  // -- admin: pipeline status snapshot -------------------------------------
  getAdminStatus(signal?: AbortSignal): Promise<ApiResult<AdminStatus>>;

  // -- practice: IRT Fisher-info recommendation (GET /practice/recommend-next) --
  recommendNextExercise(
    courseId: string,
    studentId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<RecommendResult>>;

  // -- admin: toggle pipeline killswitch (PATCH /admin/status/killswitches/:key) --
  toggleAdminKillswitch(
    key: string,
    enabled: boolean,
    signal?: AbortSignal
  ): Promise<ApiResult<{ key: string; enabled: boolean }>>;

  // -- attempts: detail with steps + presigned photos -----------------------
  getAttemptDetail(
    attemptId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<AttemptDetail>>;

  // -- practice: assign an item to a student (POST /practice/assign) --------
  assignPractice(
    input: AssignPracticeInput,
    signal?: AbortSignal
  ): Promise<ApiResult<AssignPracticeResult>>;

  // -- classrooms: soft-delete (archive) a course (DELETE /classrooms/:id) --
  deleteClassroom(courseId: string, signal?: AbortSignal): Promise<ApiResult<Classroom>>;

  // -- items: trigger AI generation (POST /items/generate) ------------------
  generateItems(
    input: GenerateItemsInput,
    signal?: AbortSignal
  ): Promise<ApiResult<GenerateItemsResult>>;
}

export function createApiClient(config: ApiClientConfig): InnovaApiClient {
  return {
    getMe(signal) {
      return request(config, {
        method: 'GET',
        path: '/auth/me',
        schema: meSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getStudentAssignments(studentId, signal) {
      return request(config, {
        method: 'GET',
        path: `/assignments/student/${encodeURIComponent(studentId)}`,
        schema: studentAssignmentsSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getMyClassrooms(signal) {
      return request(config, {
        method: 'GET',
        path: '/classrooms/mine',
        schema: classroomsSchema,
        ...(signal ? { signal } : {}),
      });
    },
    createClassroom(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/classrooms',
        json: input,
        schema: classroomSchema,
        ...(signal ? { signal } : {}),
      });
    },
    createClassroomInvite(courseId, signal) {
      return request(config, {
        method: 'POST',
        path: `/classrooms/${encodeURIComponent(courseId)}/invite`,
        schema: classroomInviteSchema,
        ...(signal ? { signal } : {}),
      });
    },
    joinClassroom(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/classrooms/join',
        json: input,
        schema: classroomSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getClassroomMastery(classroomId, signal) {
      return request(config, {
        method: 'GET',
        path: `/mastery/classroom/${encodeURIComponent(classroomId)}`,
        schema: classroomMasterySchema,
        ...(signal ? { signal } : {}),
      });
    },
    getCourseHeatmap(courseId, signal) {
      return request(config, {
        method: 'GET',
        path: `/mastery/course/${encodeURIComponent(courseId)}/heatmap`,
        schema: courseHeatmapSchema,
        ...(signal ? { signal } : {}),
      });
    },
    listChildren(signal) {
      return request(config, {
        method: 'GET',
        path: '/parent/children',
        schema: parentChildrenSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getChildSummary(studentId, signal) {
      return request(config, {
        method: 'GET',
        path: `/parent/children/${encodeURIComponent(studentId)}`,
        schema: parentChildSummarySchema,
        ...(signal ? { signal } : {}),
      });
    },
    listItems(params, signal) {
      const query =
        params === undefined
          ? undefined
          : { skillKey: params.skillKey, topic: params.topic, limit: params.limit };
      return request(config, {
        method: 'GET',
        path: '/items',
        schema: itemsSchema,
        ...(query ? { query } : {}),
        ...(signal ? { signal } : {}),
      });
    },
    getAlerts(courseId, signal) {
      return request(config, {
        method: 'GET',
        path: '/alerts',
        query: { courseId },
        schema: alertsSchema,
        ...(signal ? { signal } : {}),
      });
    },
    resolveAlert(alertId, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/alerts/${encodeURIComponent(alertId)}/resolve`,
        schema: alertSchema,
        ...(signal ? { signal } : {}),
      });
    },
    listTopics(signal) {
      return request(config, {
        method: 'GET',
        path: '/skills',
        schema: topicCatalogSchema,
        ...(signal ? { signal } : {}),
      });
    },
    listTaxonomy(signal) {
      return request(config, {
        method: 'GET',
        path: '/skills/taxonomy',
        schema: taxonomySchema,
        ...(signal ? { signal } : {}),
      });
    },
    searchCatalogErrors(params, signal) {
      return request(config, {
        method: 'GET',
        path: '/skills/error-tags',
        schema: catalogErrorListSchema,
        query: {
          q: params.q,
          domainCode: params.domainCode,
          limit: params.limit,
        },
        ...(signal ? { signal } : {}),
      });
    },
    createAttempt(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/attempts',
        json: input,
        schema: attemptResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getAttemptStatus(attemptId, signal) {
      return request(config, {
        method: 'GET',
        path: `/attempts/${encodeURIComponent(attemptId)}/status`,
        schema: attemptStatusSchema,
        ...(signal ? { signal } : {}),
      });
    },
    ocrExtract(image, signal) {
      const form = new FormData();
      form.append('image', image);
      return request(config, {
        method: 'POST',
        path: '/attempts/ocr-extract',
        form,
        schema: ocrExtractSchema,
        ...(signal ? { signal } : {}),
      });
    },
    solveAdhoc(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/attempts/solve-adhoc',
        json: input,
        schema: solveAdhocResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    reportAttemptError(attemptId, input, signal) {
      return request(config, {
        method: 'POST',
        path: `/attempts/${encodeURIComponent(attemptId)}/report`,
        json: input,
        schema: reportAckSchema,
        ...(signal ? { signal } : {}),
      });
    },

    // --- v9 guides (teacher) ---
    listGuides(params, signal) {
      const query =
        params === undefined
          ? undefined
          : {
              courseId: params.courseId,
              status: params.status,
              page: params.page,
              pageSize: params.pageSize,
            };
      return request(config, {
        method: 'GET',
        path: '/guides',
        schema: guidesListSchema,
        ...(query ? { query } : {}),
        ...(signal ? { signal } : {}),
      });
    },
    getGuide(guideId, signal) {
      return request(config, {
        method: 'GET',
        path: `/guides/${encodeURIComponent(guideId)}`,
        schema: guideDetailSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getGuideSourceUrl(guideId, signal) {
      return request(config, {
        method: 'GET',
        path: `/guides/${encodeURIComponent(guideId)}/source-url`,
        schema: guideSourceUrlSchema,
        ...(signal ? { signal } : {}),
      });
    },
    createGuide(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/guides',
        json: input,
        schema: createGuideResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    ingestGuide(guideId, signal) {
      return request(config, {
        method: 'POST',
        path: `/guides/${encodeURIComponent(guideId)}/ingest`,
        schema: ingestResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    updateGuide(guideId, input, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/guides/${encodeURIComponent(guideId)}`,
        json: input,
        schema: guideSchema,
        ...(signal ? { signal } : {}),
      });
    },
    updateGuideQuestion(guideId, questionId, input, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/guides/${encodeURIComponent(guideId)}/questions/${encodeURIComponent(questionId)}`,
        json: input,
        schema: guideQuestionAckSchema,
        ...(signal ? { signal } : {}),
      });
    },
    updateGuideSolution(guideId, questionId, input, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/guides/${encodeURIComponent(guideId)}/questions/${encodeURIComponent(
          questionId
        )}/solution`,
        json: input,
        schema: solutionAckSchema,
        ...(signal ? { signal } : {}),
      });
    },
    regenerateSolution(guideId, questionId, signal) {
      return request(config, {
        method: 'POST',
        path: `/guides/${encodeURIComponent(guideId)}/questions/${encodeURIComponent(
          questionId
        )}/regenerate-solution`,
        schema: enqueueResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    publishGuide(guideId, signal) {
      return request(config, {
        method: 'POST',
        path: `/guides/${encodeURIComponent(guideId)}/publish`,
        schema: publishResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    archiveGuide(guideId, signal) {
      return request(config, {
        method: 'DELETE',
        path: `/guides/${encodeURIComponent(guideId)}`,
        schema: guideSchema,
        ...(signal ? { signal } : {}),
      });
    },

    // --- v9 guides (student) ---
    listStudentGuides(signal) {
      return request(config, {
        method: 'GET',
        path: '/student/guides',
        schema: studentGuidesSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getQuiz(guideId, signal) {
      return request(config, {
        method: 'GET',
        path: `/student/guides/${encodeURIComponent(guideId)}`,
        schema: quizSchema,
        ...(signal ? { signal } : {}),
      });
    },
    createSubmission(guideId, questionId, input, signal) {
      return request(config, {
        method: 'POST',
        path: `/student/guides/${encodeURIComponent(guideId)}/questions/${encodeURIComponent(
          questionId
        )}/submissions`,
        json: input,
        schema: createSubmissionResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    completeSubmission(submissionId, signal) {
      return request(config, {
        method: 'POST',
        path: `/student/submissions/${encodeURIComponent(submissionId)}/complete`,
        schema: completeResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getSubmissionStatus(submissionId, signal) {
      return request(config, {
        method: 'GET',
        path: `/student/submissions/${encodeURIComponent(submissionId)}/status`,
        schema: submissionStatusResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getGuideResults(guideId, signal) {
      return request(config, {
        method: 'GET',
        path: `/student/guides/${encodeURIComponent(guideId)}/results`,
        schema: guideResultsSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getScanPageUploadUrl(guideId, signal) {
      return request(config, {
        method: 'GET',
        path: `/student/guides/${encodeURIComponent(guideId)}/scan-page-url`,
        schema: scanPageUploadUrlSchema,
        ...(signal ? { signal } : {}),
      });
    },
    processScanPage(guideId, photoKey, signal) {
      return request(config, {
        method: 'POST',
        path: `/student/guides/${encodeURIComponent(guideId)}/scan-page`,
        json: { photoKey },
        schema: scanPageResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getGuideResultsMatrix(guideId, signal) {
      return request(config, {
        method: 'GET',
        path: `/guides/${encodeURIComponent(guideId)}/results`,
        schema: guideResultsMatrixSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getSubmissionDetail(guideId, submissionId, signal) {
      return request(config, {
        method: 'GET',
        path: `/guides/${encodeURIComponent(guideId)}/submissions/${encodeURIComponent(
          submissionId
        )}`,
        schema: submissionDetailSchema,
        ...(signal ? { signal } : {}),
      });
    },
    overrideSubmissionError(guideId, submissionId, input, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/guides/${encodeURIComponent(guideId)}/submissions/${encodeURIComponent(
          submissionId
        )}/error-tag`,
        schema: overrideErrorAckSchema,
        json: { errorTagCode: input.errorTagCode },
        ...(signal ? { signal } : {}),
      });
    },
    listErrorTags(params, signal) {
      const query =
        params === undefined
          ? undefined
          : {
              status: params.status,
              domainCode: params.domainCode,
              source: params.source,
              q: params.q,
              cursor: params.cursor,
              limit: params.limit,
            };
      return request(config, {
        method: 'GET',
        path: '/admin/error-tags',
        schema: adminErrorTagListSchema,
        ...(query ? { query } : {}),
        ...(signal ? { signal } : {}),
      });
    },
    updateErrorTagStatus(code, status, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/admin/error-tags/${encodeURIComponent(code)}/status`,
        schema: adminErrorTagSchema,
        json: { status },
        ...(signal ? { signal } : {}),
      });
    },
    getAdminStatus(signal) {
      return request(config, {
        method: 'GET',
        path: '/admin/status',
        schema: adminStatusSchema,
        ...(signal ? { signal } : {}),
      });
    },
    recommendNextExercise(_courseId, studentId, signal) {
      return request(config, {
        method: 'GET',
        path: '/practice/recommend-next',
        schema: recommendResultSchema,
        query: { studentId },
        ...(signal ? { signal } : {}),
      });
    },
    toggleAdminKillswitch(key, enabled, signal) {
      return request(config, {
        method: 'PATCH',
        path: `/admin/status/killswitches/${encodeURIComponent(key)}`,
        json: { enabled },
        schema: killswitchToggleResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    getAttemptDetail(attemptId, signal) {
      return request(config, {
        method: 'GET',
        path: `/attempts/${encodeURIComponent(attemptId)}/detail`,
        schema: attemptDetailSchema,
        ...(signal ? { signal } : {}),
      });
    },
    assignPractice(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/practice/assign',
        json: { studentId: input.studentId, itemIds: [...input.itemIds], ...(input.dueAt ? { dueAt: input.dueAt } : {}) },
        schema: assignPracticeResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
    deleteClassroom(courseId, signal) {
      return request(config, {
        method: 'DELETE',
        path: `/classrooms/${encodeURIComponent(courseId)}`,
        schema: classroomSchema,
        ...(signal ? { signal } : {}),
      });
    },
    generateItems(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/items/generate',
        json: input,
        schema: generateItemsResultSchema,
        ...(signal ? { signal } : {}),
      });
    },
  };
}
