import type {
  Exercise,
  SkillProgress,
  PracticeAssignment,
  ChildProgress,
} from './types';

export const MOCK_STUDENT_NAME = 'María';
export const MOCK_CHILD_NAME = 'María';

export const MOCK_EXERCISES: Exercise[] = [
  {
    id: '1',
    problem: '345 − 178',
    skill: 'Resta con Reserva',
    difficulty: 'Medio',
    expectedAnswer: 167,
  },
  {
    id: '2',
    problem: '523 − 267',
    skill: 'Resta con Reserva',
    difficulty: 'Difícil',
    expectedAnswer: 256,
  },
  {
    id: '3',
    problem: '46 + 37',
    skill: 'Suma con Llevadas',
    difficulty: 'Fácil',
    expectedAnswer: 83,
  },
  {
    id: '4',
    problem: '712 − 489',
    skill: 'Resta con Reserva',
    difficulty: 'Difícil',
    expectedAnswer: 223,
  },
  {
    id: '5',
    problem: '68 + 54',
    skill: 'Suma con Llevadas',
    difficulty: 'Medio',
    expectedAnswer: 122,
  },
];

export const MOCK_SKILL_PROGRESS: SkillProgress[] = [
  {
    skillId: 'resta-reserva',
    skillName: 'Resta con Reserva',
    pKnown: 0.45,
    attempts: 12,
  },
  {
    skillId: 'suma-llevadas',
    skillName: 'Suma con Llevadas',
    pKnown: 0.75,
    attempts: 20,
  },
  {
    skillId: 'multiplicacion',
    skillName: 'Multiplicación Básica',
    pKnown: 0.28,
    attempts: 7,
  },
];

export const MOCK_ASSIGNMENTS: PracticeAssignment[] = [
  {
    id: 'a1',
    skill: 'Resta con Reserva',
    pendingCount: 3,
    dueDate: '2026-05-10',
    status: 'pending',
  },
  {
    id: 'a2',
    skill: 'Suma con Llevadas',
    pendingCount: 0,
    dueDate: '2026-05-05',
    status: 'completed',
  },
  {
    id: 'a3',
    skill: 'Multiplicación Básica',
    pendingCount: 5,
    dueDate: null,
    status: 'pending',
  },
];

export const MOCK_CHILD_PROGRESS: ChildProgress = {
  childName: MOCK_CHILD_NAME,
  exercisesThisWeek: 8,
  skills: MOCK_SKILL_PROGRESS,
};
