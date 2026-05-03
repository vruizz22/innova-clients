export interface StudentMastery {
  studentId: string;
  studentName: string;
  skills: Array<{
    skillKey: string;
    skillLabel: string;
    pKnown: number; // 0-1
    attemptsCount: number;
  }>;
}

export interface TeacherAlert {
  id: string;
  alertType: 'AT_RISK_SKILL' | 'COMMON_ERROR_DETECTED' | 'STUDENT_DROP';
  classroomId: string;
  payload: {
    skillKey?: string;
    skillLabel?: string;
    studentIds?: string[];
    errorType?: string;
    studentId?: string;
    studentName?: string;
    previousLevel?: string;
    currentLevel?: string;
  };
  createdAt: string;
  resolvedAt: string | null;
}

export interface AttemptHistory {
  id: string;
  itemContent: { problem: string; canonicalSolution: string };
  finalAnswer: string;
  isCorrect: boolean;
  errorType: string | null;
  classifierSource: string;
  confidence: number | null;
  durationMs: number;
  createdAt: string;
}

export interface ErrorFrequency {
  errorType: string;
  count: number;
  percentage: number;
}
