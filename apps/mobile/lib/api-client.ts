import type { UserRole } from './types';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole | 'teacher' | 'admin';
  };
};

export type AttemptResponse = {
  attemptId: string;
  isCorrect: boolean;
  errorType: string;
  classifierSource: 'RULE_ENGINE' | 'LLM';
  confidence: number;
};

export type ClassroomRecord = {
  id: string;
  name: string;
  description: string | null;
  schoolId: string | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_API_URL = 'http://localhost:3000';

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

async function requestJson<TResponse>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: object;
    accessToken?: string | null;
  } = {},
): Promise<TResponse> {
  const headers: Record<string, string> = {};

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(new URL(path, getApiBaseUrl()).toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (text ? JSON.parse(text) : undefined) as TResponse;
}

export function login(email: string, password: string): Promise<AuthSession> {
  return requestJson<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(email: string, password: string, role: UserRole): Promise<AuthSession> {
  return requestJson<AuthSession>('/auth/register', {
    method: 'POST',
    body: { email, password, role },
  });
}

export function getMyStudentClassrooms(accessToken: string): Promise<ClassroomRecord[]> {
  return requestJson<ClassroomRecord[]>('/classrooms/student/mine', { accessToken });
}

export function joinClassroom(code: string, accessToken: string): Promise<ClassroomRecord> {
  return requestJson<ClassroomRecord>('/classrooms/join', {
    method: 'POST',
    body: { code },
    accessToken,
  });
}

export function createAttempt(input: {
  accessToken: string;
  studentId: string;
  skillKey: string;
  rawSteps: Array<{ expression: string; isFinal: boolean }>;
  expectedAnswer: number;
  studentAnswer: number;
  minuend?: number;
  subtrahend?: number;
}): Promise<AttemptResponse> {
  const { accessToken, ...body } = input;
  return requestJson<AttemptResponse>('/attempts', {
    method: 'POST',
    accessToken,
    body,
  });
}
