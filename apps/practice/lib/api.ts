// Typed API client for the practice app

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ---- Types ---------------------------------------------------------------

export interface PracticeItem {
  id: string;
  skillKey: string;
  skillLabel: string;
  content: {
    problem: string;
    canonicalSolution: string;
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
  itemId: string;
  skillKey: string;
  rawSteps: RawStep[];
  expectedAnswer: number;
  studentAnswer: number;
}

export interface AttemptResult {
  id: string;
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

// ---- Helpers ---------------------------------------------------------------

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

async function apiPost<TBody, TResult>(path: string, body: TBody): Promise<TResult> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<TResult>;
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
