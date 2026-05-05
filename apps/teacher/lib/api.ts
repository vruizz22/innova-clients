// Typed API client for the teacher app
import { getAccessToken } from '@shared/auth-session';
import { getPublicRuntimeConfig } from '@shared/runtime-config';

const BASE_URL = getPublicRuntimeConfig().apiUrl;

export interface MasteryEntry {
  skillKey: string;
  skillLabel: string;
  pKnown: number;
}

export interface AlertRecord {
  id: string;
  alertType: 'AT_RISK_SKILL' | 'COMMON_ERROR_DETECTED' | 'STUDENT_DROP';
  classroomId: string;
  studentId?: string;
  message: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecord {
  studentId: string;
  studentName: string;
  avgMastery: number;
  topError: string | null;
  attemptsCount: number;
}

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
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return unwrapApiData(await res.json() as T | { data?: T });
}

async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return unwrapApiData(await res.json() as T | { data?: T });
}

export async function getAlerts(classroomId: string): Promise<AlertRecord[]> {
  return apiGet<AlertRecord[]>(`/alerts?classroomId=${classroomId}`);
}

export async function getMasteryHeatmap(studentId: string): Promise<MasteryEntry[]> {
  return apiGet<MasteryEntry[]>(`/mastery/${studentId}`);
}

export async function getStudents(classroomId: string): Promise<StudentRecord[]> {
  const students = await apiGet<Array<{
    studentId: string;
    studentName: string;
    skills: Array<{ pKnown: number; attemptsCount: number }>;
  }>>(`/mastery/classroom/${classroomId}`);

  return students.map((student) => {
    const avgMastery =
      student.skills.reduce((sum, skill) => sum + skill.pKnown, 0) / Math.max(student.skills.length, 1);
    return {
      studentId: student.studentId,
      studentName: student.studentName,
      avgMastery,
      topError: null,
      attemptsCount: student.skills.reduce((sum, skill) => sum + skill.attemptsCount, 0),
    };
  });
}

export async function resolveAlert(alertId: string): Promise<void> {
  await apiPatch<unknown>(`/alerts/${alertId}/resolve`);
}
