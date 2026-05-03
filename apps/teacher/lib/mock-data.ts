import type { AttemptHistory, ErrorFrequency, StudentMastery, TeacherAlert } from './types';

// ── Students ──────────────────────────────────────────────────────────────
export const mockStudents: StudentMastery[] = [
  {
    studentId: 'stu-001',
    studentName: 'María',
    skills: [
      { skillKey: 'subtraction_borrow', skillLabel: 'Resta con Reserva', pKnown: 0.82, attemptsCount: 14 },
      { skillKey: 'addition_carry',     skillLabel: 'Suma con Llevadas',  pKnown: 0.74, attemptsCount: 12 },
      { skillKey: 'fractions_addsub',   skillLabel: 'Fracciones',         pKnown: 0.55, attemptsCount: 8  },
    ],
  },
  {
    studentId: 'stu-002',
    studentName: 'Carlos',
    skills: [
      { skillKey: 'subtraction_borrow', skillLabel: 'Resta con Reserva', pKnown: 0.38, attemptsCount: 16 },
      { skillKey: 'addition_carry',     skillLabel: 'Suma con Llevadas',  pKnown: 0.45, attemptsCount: 11 },
      { skillKey: 'fractions_addsub',   skillLabel: 'Fracciones',         pKnown: 0.21, attemptsCount: 9  },
    ],
  },
  {
    studentId: 'stu-003',
    studentName: 'Javiera',
    skills: [
      { skillKey: 'subtraction_borrow', skillLabel: 'Resta con Reserva', pKnown: 0.91, attemptsCount: 18 },
      { skillKey: 'addition_carry',     skillLabel: 'Suma con Llevadas',  pKnown: 0.88, attemptsCount: 15 },
      { skillKey: 'fractions_addsub',   skillLabel: 'Fracciones',         pKnown: 0.72, attemptsCount: 10 },
    ],
  },
  {
    studentId: 'stu-004',
    studentName: 'Diego',
    skills: [
      { skillKey: 'subtraction_borrow', skillLabel: 'Resta con Reserva', pKnown: 0.42, attemptsCount: 13 },
      { skillKey: 'addition_carry',     skillLabel: 'Suma con Llevadas',  pKnown: 0.51, attemptsCount: 10 },
      { skillKey: 'fractions_addsub',   skillLabel: 'Fracciones',         pKnown: 0.28, attemptsCount: 7  },
    ],
  },
  {
    studentId: 'stu-005',
    studentName: 'Valentina',
    skills: [
      { skillKey: 'subtraction_borrow', skillLabel: 'Resta con Reserva', pKnown: 0.67, attemptsCount: 15 },
      { skillKey: 'addition_carry',     skillLabel: 'Suma con Llevadas',  pKnown: 0.70, attemptsCount: 13 },
      { skillKey: 'fractions_addsub',   skillLabel: 'Fracciones',         pKnown: 0.10, attemptsCount: 5  },
    ],
  },
];

// ── Alerts ────────────────────────────────────────────────────────────────
export const mockAlerts: TeacherAlert[] = [
  {
    id: 'alert-001',
    alertType: 'AT_RISK_SKILL',
    classroomId: 'cls-4a',
    payload: {
      skillKey: 'fractions_addsub',
      skillLabel: 'Fracciones',
      studentIds: ['stu-002', 'stu-004', 'stu-005'],
    },
    createdAt: '2026-05-03T08:15:00Z',
    resolvedAt: null,
  },
  {
    id: 'alert-002',
    alertType: 'COMMON_ERROR_DETECTED',
    classroomId: 'cls-4a',
    payload: {
      errorType: 'BORROW_OMITTED_TENS',
      studentIds: ['stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005'],
    },
    createdAt: '2026-05-03T07:00:00Z',
    resolvedAt: null,
  },
  {
    id: 'alert-003',
    alertType: 'STUDENT_DROP',
    classroomId: 'cls-4a',
    payload: {
      studentId: 'stu-002',
      studentName: 'Carlos',
      skillKey: 'subtraction_borrow',
      skillLabel: 'Resta con Reserva',
      previousLevel: 'PROFICIENT',
      currentLevel: 'STRUGGLING',
    },
    createdAt: '2026-05-02T18:30:00Z',
    resolvedAt: null,
  },
];

// ── Attempt history ────────────────────────────────────────────────────────
export const mockAttempts: Record<string, AttemptHistory[]> = {
  'stu-001': [
    { id: 'att-101', itemContent: { problem: '53 − 28', canonicalSolution: '25' }, finalAnswer: '25', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 34200, createdAt: '2026-05-03T09:00:00Z' },
    { id: 'att-102', itemContent: { problem: '71 − 46', canonicalSolution: '25' }, finalAnswer: '35', isCorrect: false, errorType: 'BORROW_OMITTED_TENS', classifierSource: 'rule',  confidence: null, durationMs: 45100, createdAt: '2026-05-03T09:05:00Z' },
    { id: 'att-103', itemContent: { problem: '82 − 37', canonicalSolution: '45' }, finalAnswer: '45', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 29800, createdAt: '2026-05-03T09:10:00Z' },
    { id: 'att-104', itemContent: { problem: '64 − 19', canonicalSolution: '45' }, finalAnswer: '55', isCorrect: false, errorType: 'BORROW_OMITTED_TENS', classifierSource: 'llm',   confidence: 0.91, durationMs: 52300, createdAt: '2026-05-03T09:15:00Z' },
    { id: 'att-105', itemContent: { problem: '90 − 43', canonicalSolution: '47' }, finalAnswer: '47', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 38700, createdAt: '2026-05-03T09:20:00Z' },
  ],
  'stu-002': [
    { id: 'att-201', itemContent: { problem: '53 − 28', canonicalSolution: '25' }, finalAnswer: '35', isCorrect: false, errorType: 'BORROW_OMITTED_TENS',  classifierSource: 'rule',  confidence: null, durationMs: 61200, createdAt: '2026-05-03T09:00:00Z' },
    { id: 'att-202', itemContent: { problem: '71 − 46', canonicalSolution: '25' }, finalAnswer: '35', isCorrect: false, errorType: 'BORROW_OMITTED_TENS',  classifierSource: 'rule',  confidence: null, durationMs: 58400, createdAt: '2026-05-03T09:05:00Z' },
    { id: 'att-203', itemContent: { problem: '42 − 17', canonicalSolution: '25' }, finalAnswer: '25', isCorrect: true,  errorType: null,                  classifierSource: 'rule',  confidence: null, durationMs: 44700, createdAt: '2026-05-03T09:10:00Z' },
    { id: 'att-204', itemContent: { problem: '60 − 33', canonicalSolution: '27' }, finalAnswer: '37', isCorrect: false, errorType: 'PLACE_VALUE_ERROR',    classifierSource: 'llm',   confidence: 0.85, durationMs: 73100, createdAt: '2026-05-03T09:15:00Z' },
    { id: 'att-205', itemContent: { problem: '81 − 24', canonicalSolution: '57' }, finalAnswer: '67', isCorrect: false, errorType: 'BORROW_OMITTED_TENS',  classifierSource: 'rule',  confidence: null, durationMs: 67800, createdAt: '2026-05-03T09:20:00Z' },
    { id: 'att-206', itemContent: { problem: '75 − 38', canonicalSolution: '37' }, finalAnswer: '37', isCorrect: true,  errorType: null,                  classifierSource: 'rule',  confidence: null, durationMs: 55200, createdAt: '2026-05-03T09:25:00Z' },
  ],
  'stu-003': [
    { id: 'att-301', itemContent: { problem: '93 − 47', canonicalSolution: '46' }, finalAnswer: '46', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 22100, createdAt: '2026-05-03T09:00:00Z' },
    { id: 'att-302', itemContent: { problem: '81 − 36', canonicalSolution: '45' }, finalAnswer: '45', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 19800, createdAt: '2026-05-03T09:05:00Z' },
    { id: 'att-303', itemContent: { problem: '74 − 29', canonicalSolution: '45' }, finalAnswer: '45', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 25300, createdAt: '2026-05-03T09:10:00Z' },
    { id: 'att-304', itemContent: { problem: '62 − 18', canonicalSolution: '44' }, finalAnswer: '54', isCorrect: false, errorType: 'BORROW_OMITTED_TENS', classifierSource: 'llm',   confidence: 0.93, durationMs: 31600, createdAt: '2026-05-03T09:15:00Z' },
    { id: 'att-305', itemContent: { problem: '95 − 57', canonicalSolution: '38' }, finalAnswer: '38', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 20900, createdAt: '2026-05-03T09:20:00Z' },
  ],
  'stu-004': [
    { id: 'att-401', itemContent: { problem: '53 − 28', canonicalSolution: '25' }, finalAnswer: '35', isCorrect: false, errorType: 'BORROW_OMITTED_TENS',  classifierSource: 'rule',  confidence: null, durationMs: 88100, createdAt: '2026-05-03T09:00:00Z' },
    { id: 'att-402', itemContent: { problem: '40 − 17', canonicalSolution: '23' }, finalAnswer: '33', isCorrect: false, errorType: 'PLACE_VALUE_ERROR',    classifierSource: 'llm',   confidence: 0.78, durationMs: 92400, createdAt: '2026-05-03T09:05:00Z' },
    { id: 'att-403', itemContent: { problem: '66 − 29', canonicalSolution: '37' }, finalAnswer: '43', isCorrect: false, errorType: 'OPERATOR_CONFUSION',   classifierSource: 'llm',   confidence: 0.72, durationMs: 105200, createdAt: '2026-05-03T09:10:00Z' },
    { id: 'att-404', itemContent: { problem: '51 − 14', canonicalSolution: '37' }, finalAnswer: '37', isCorrect: true,  errorType: null,                  classifierSource: 'rule',  confidence: null, durationMs: 71500, createdAt: '2026-05-03T09:15:00Z' },
    { id: 'att-405', itemContent: { problem: '72 − 36', canonicalSolution: '36' }, finalAnswer: '46', isCorrect: false, errorType: 'BORROW_OMITTED_TENS',  classifierSource: 'rule',  confidence: null, durationMs: 83700, createdAt: '2026-05-03T09:20:00Z' },
    { id: 'att-406', itemContent: { problem: '85 − 48', canonicalSolution: '37' }, finalAnswer: '47', isCorrect: false, errorType: 'BORROW_OMITTED_TENS',  classifierSource: 'rule',  confidence: null, durationMs: 79200, createdAt: '2026-05-03T09:25:00Z' },
    { id: 'att-407', itemContent: { problem: '93 − 55', canonicalSolution: '38' }, finalAnswer: '38', isCorrect: true,  errorType: null,                  classifierSource: 'rule',  confidence: null, durationMs: 64100, createdAt: '2026-05-03T09:30:00Z' },
  ],
  'stu-005': [
    { id: 'att-501', itemContent: { problem: '67 − 39', canonicalSolution: '28' }, finalAnswer: '38', isCorrect: false, errorType: 'BORROW_OMITTED_TENS', classifierSource: 'rule',  confidence: null, durationMs: 54300, createdAt: '2026-05-03T09:00:00Z' },
    { id: 'att-502', itemContent: { problem: '54 − 27', canonicalSolution: '27' }, finalAnswer: '27', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 43800, createdAt: '2026-05-03T09:05:00Z' },
    { id: 'att-503', itemContent: { problem: '83 − 46', canonicalSolution: '37' }, finalAnswer: '47', isCorrect: false, errorType: 'BORROW_OMITTED_TENS', classifierSource: 'rule',  confidence: null, durationMs: 62100, createdAt: '2026-05-03T09:10:00Z' },
    { id: 'att-504', itemContent: { problem: '76 − 48', canonicalSolution: '28' }, finalAnswer: '28', isCorrect: true,  errorType: null,                 classifierSource: 'rule',  confidence: null, durationMs: 39700, createdAt: '2026-05-03T09:15:00Z' },
    { id: 'att-505', itemContent: { problem: '91 − 54', canonicalSolution: '37' }, finalAnswer: '47', isCorrect: false, errorType: 'PLACE_VALUE_ERROR',   classifierSource: 'llm',   confidence: 0.81, durationMs: 71400, createdAt: '2026-05-03T09:20:00Z' },
  ],
};

// ── Error frequency ────────────────────────────────────────────────────────
export const mockErrorFrequency: Record<string, ErrorFrequency[]> = {
  'stu-001': [
    { errorType: 'BORROW_OMITTED_TENS', count: 2, percentage: 67 },
    { errorType: 'PLACE_VALUE_ERROR',   count: 1, percentage: 33 },
  ],
  'stu-002': [
    { errorType: 'BORROW_OMITTED_TENS', count: 3, percentage: 60 },
    { errorType: 'PLACE_VALUE_ERROR',   count: 1, percentage: 20 },
    { errorType: 'CARRY_FORGOTTEN',     count: 1, percentage: 20 },
  ],
  'stu-003': [
    { errorType: 'BORROW_OMITTED_TENS', count: 1, percentage: 100 },
  ],
  'stu-004': [
    { errorType: 'BORROW_OMITTED_TENS', count: 3, percentage: 50 },
    { errorType: 'PLACE_VALUE_ERROR',   count: 1, percentage: 17 },
    { errorType: 'OPERATOR_CONFUSION',  count: 1, percentage: 17 },
    { errorType: 'CARRY_FORGOTTEN',     count: 1, percentage: 17 },
  ],
  'stu-005': [
    { errorType: 'BORROW_OMITTED_TENS', count: 2, percentage: 67 },
    { errorType: 'PLACE_VALUE_ERROR',   count: 1, percentage: 33 },
  ],
};
