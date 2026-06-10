import { request, type ApiClientConfig, type ApiResult } from './http';
import {
  alertsSchema,
  attemptResultSchema,
  classroomMasterySchema,
  classroomsSchema,
  itemsSchema,
  meSchema,
  ocrExtractSchema,
  studentAssignmentsSchema,
  type Alert,
  type AttemptResult,
  type Classroom,
  type CourseStudentMastery,
  type CreateAttemptInput,
  type Item,
  type Me,
  type OcrExtractResult,
  type StudentAssignment,
} from './schemas';

export interface ListItemsParams {
  readonly skillKey?: string;
  readonly topic?: string;
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
  getClassroomMastery(
    classroomId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<CourseStudentMastery[]>>;
  listItems(params?: ListItemsParams, signal?: AbortSignal): Promise<ApiResult<Item[]>>;
  getAlerts(courseId: string, signal?: AbortSignal): Promise<ApiResult<Alert[]>>;
  createAttempt(input: CreateAttemptInput, signal?: AbortSignal): Promise<ApiResult<AttemptResult>>;
  ocrExtract(image: Blob, signal?: AbortSignal): Promise<ApiResult<OcrExtractResult>>;
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
    getClassroomMastery(classroomId, signal) {
      return request(config, {
        method: 'GET',
        path: `/mastery/classroom/${encodeURIComponent(classroomId)}`,
        schema: classroomMasterySchema,
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
    createAttempt(input, signal) {
      return request(config, {
        method: 'POST',
        path: '/attempts',
        json: input,
        schema: attemptResultSchema,
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
  };
}
