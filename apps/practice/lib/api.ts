// Typed API client for the practice app
import { getAccessToken } from '@shared/auth-session';
import { getPublicRuntimeConfig } from '@shared/runtime-config';

const BASE_URL = getPublicRuntimeConfig().apiUrl;

// ---- Types ---------------------------------------------------------------

export interface PracticeItem {
  id: string;
  isFallback?: boolean;
  skillKey: string;
  skillLabel: string;
  content: {
    problem: string;
    prompt?: string;
    expectedAnswer?: number | null;
    canonicalSolution?: string;
    minuend?: number;
    subtrahend?: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface RawStep {
  expression: string;
  isFinal: boolean;
}

export interface SubmitAttemptPayload {
  studentId: string;
  itemId?: string;
  skillKey: string;
  rawSteps: RawStep[];
  expectedAnswer: number;
  studentAnswer: number;
  minuend?: number;
  subtrahend?: number;
}

export interface AttemptResult {
  attemptId?: string;
  id?: string;
  isCorrect: boolean;
  errorType: string | null;
  confidence: number;
  feedback?: string;
}

export interface AttemptStatusResult {
  id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  isCorrect: boolean | null;
  errorType: string | null;
}

export interface ClassroomRecord {
  id: string;
  name: string;
  description: string | null;
  schoolId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Helpers ---------------------------------------------------------------

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapApiData<T>(payload: T | { data?: T }): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data?: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(new URL(path, BASE_URL).toString(), {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return unwrapApiData(await res.json() as T | { data?: T });
}

async function apiPost<TBody, TResult>(path: string, body: TBody): Promise<TResult> {
  const res = await fetch(new URL(path, BASE_URL).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return unwrapApiData(await res.json() as TResult | { data?: TResult });
}

// ---- API functions -------------------------------------------------------

export async function getItems(params?: { topic?: string; limit?: number }): Promise<PracticeItem[]> {
  const query = new URLSearchParams();
  if (params?.topic) query.set('topic', params.topic);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGet<PracticeItem[]>(`/items${qs ? `?${qs}` : ''}`);
}

export async function getItem(itemId: string): Promise<PracticeItem> {
  return apiGet<PracticeItem>(`/items/${itemId}`);
}

export async function submitAttempt(payload: SubmitAttemptPayload): Promise<AttemptResult> {
  return apiPost<SubmitAttemptPayload, AttemptResult>('/attempts', payload);
}

export async function getAttemptStatus(attemptId: string): Promise<AttemptStatusResult> {
  return apiGet<AttemptStatusResult>(`/attempts/${attemptId}/status`);
}

export async function getMyStudentClassrooms(): Promise<ClassroomRecord[]> {
  return apiGet<ClassroomRecord[]>('/classrooms/student/mine');
}

export interface JoinClassroomResult {
  id: string;
  name: string;
}

export async function joinClassroom(code: string): Promise<JoinClassroomResult> {
  return apiPost<{ code: string }, JoinClassroomResult>('/classrooms/join', { code });
}

export interface MasteryRecord {
  skillKey: string;
  skillLabel: string;
  pKnown: number;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  profileId?: string;
}

export async function getMastery(studentId: string): Promise<MasteryRecord[]> {
  return apiGet<MasteryRecord[]>(`/mastery/${studentId}`);
}

export async function getMe(): Promise<{ user: UserProfile }> {
  return apiGet<{ user: UserProfile }>('/auth/me');
}
