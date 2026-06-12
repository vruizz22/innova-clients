import type { StudentAssignment } from '@innova/api-client';

/**
 * A single exercise flattened out of the student's assignments, in the shape the
 * practice UI renders and the solve flow submits. Fully serialisable so it can
 * cross the RSC → Client Component boundary.
 */
export interface PracticeExercise {
  readonly assignmentId: string;
  readonly assignmentTitle: string;
  readonly exerciseId: string;
  readonly sequence: number;
  readonly problem: string;
  readonly skill: string;
  readonly topicCode: string;
  readonly difficultyLabel: string;
  readonly expectedAnswer: number | null;
}

/** Maps an IRT `b` (difficulty) parameter to a human label for students. */
export function irtBToLabel(irtB: number): string {
  if (irtB < -0.5) return 'Fácil';
  if (irtB > 0.5) return 'Difícil';
  return 'Media';
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Flattens assignments → ordered exercise list (pending assignments only). */
export function flattenAssignments(assignments: readonly StudentAssignment[]): PracticeExercise[] {
  const out: PracticeExercise[] = [];
  for (const target of assignments) {
    if (target.status === 'COMPLETED' || target.status === 'CANCELLED') continue;
    for (const ae of target.assignment.assignmentExercises) {
      const { exercise } = ae;
      const problem = exercise.content.prompt ?? exercise.content.problem ?? '—';
      out.push({
        assignmentId: target.assignmentId,
        assignmentTitle: target.assignment.title,
        exerciseId: exercise.id,
        sequence: ae.sequence,
        problem,
        skill: exercise.topic.name,
        topicCode: exercise.topic.code,
        difficultyLabel: irtBToLabel(exercise.irtB),
        expectedAnswer: toNumberOrNull(exercise.content.expectedAnswer),
      });
    }
  }
  return out.sort((a, b) => a.sequence - b.sequence);
}
