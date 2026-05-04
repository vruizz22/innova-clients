// SuperProfes Mobile — shared TypeScript types

export type UserRole = 'student' | 'parent';

export type Difficulty = 'Fácil' | 'Medio' | 'Difícil';

export type ErrorType =
  | 'BORROW_OMITTED_TENS'
  | 'BORROW_OMITTED_HUNDREDS'
  | 'SUBTRAHEND_MINUEND_SWAPPED'
  | 'DIGIT_TRANSPOSITION'
  | 'CARRY_OMITTED'
  | 'CORRECT';

export type MasteryLevel = 'Dominado' | 'Aprendiendo' | 'Necesita práctica';

export interface Exercise {
  id: string;
  problem: string;
  skill: string;
  difficulty: Difficulty;
  expectedAnswer: number;
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  pKnown: number; // 0–1
  attempts: number;
}

export interface PracticeAssignment {
  id: string;
  skill: string;
  pendingCount: number;
  dueDate: string | null;
  status: 'pending' | 'completed';
}

export interface ChildProgress {
  childName: string;
  exercisesThisWeek: number;
  skills: SkillProgress[];
}

export interface AttemptResult {
  isCorrect: boolean;
  errorType: ErrorType | null;
}

// Navigation routes
export type AuthScreen = 'login' | 'register';
export type StudentScreen = 'practice-home' | 'practice-exercise' | 'progress';
export type ParentScreen = 'assignments' | 'progress';

export type AppScreen =
  | { zone: 'auth'; screen: AuthScreen }
  | { zone: 'student'; screen: StudentScreen; exerciseId?: string }
  | { zone: 'parent'; screen: ParentScreen };
