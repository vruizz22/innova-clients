// Typed API client for the teacher app

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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
  if (typeof window === 'undefined') return {};
  const raw = sessionStorage.getItem('auth_session');
  if (!raw) return {};
  try {
    const session = JSON.parse(raw) as { accessToken?: string };
    return session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
  } catch {
    return {};
  }
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getAlerts(classroomId: string): Promise<AlertRecord[]> {
  return apiGet<AlertRecord[]>(`/classrooms/${classroomId}/alerts`);
}

export async function getMasteryHeatmap(studentId: string): Promise<MasteryEntry[]> {
  return apiGet<MasteryEntry[]>(`/students/${studentId}/mastery`);
}

export async function getStudents(classroomId: string): Promise<StudentRecord[]> {
  return apiGet<StudentRecord[]>(`/classrooms/${classroomId}/students`);
}

export async function resolveAlert(alertId: string): Promise<void> {
  await apiPatch<unknown>(`/alerts/${alertId}/resolve`);
}
