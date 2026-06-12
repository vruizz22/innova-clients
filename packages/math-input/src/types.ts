/** One intermediate working line the student wrote, with how long it took. */
export interface StepInput {
  readonly value: string;
  readonly stepIndex: number;
  readonly durationMs: number;
}

/** Full output of a solve session, ready to map onto POST /attempts rawSteps. */
export interface MathInputResult {
  /** Intermediate work rows in order (may be empty). */
  readonly steps: ReadonlyArray<StepInput>;
  /** The final numeric answer as a plain string. */
  readonly finalAnswer: string;
  /** Wall-clock time from first render to submit. */
  readonly totalDurationMs: number;
}

/** Which field the virtual keypad currently writes into. */
export type ActiveField =
  | { readonly kind: 'step'; readonly index: number }
  | { readonly kind: 'final' };
