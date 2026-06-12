import { describe, it, expect } from 'vitest';
import { createApiClient } from './index';

describe('api-client guide methods', () => {
  it('exposes every v9 guide method', () => {
    const api = createApiClient({ baseUrl: 'http://x', getToken: async () => null });
    for (const m of [
      'listGuides',
      'getGuide',
      'createGuide',
      'ingestGuide',
      'updateGuide',
      'updateGuideQuestion',
      'updateGuideSolution',
      'regenerateSolution',
      'publishGuide',
      'archiveGuide',
      'listStudentGuides',
      'getQuiz',
      'createSubmission',
      'completeSubmission',
      'getSubmissionStatus',
      'getGuideResults',
      'getGuideResultsMatrix',
      'getSubmissionDetail',
      'overrideSubmissionError',
    ] as const) {
      expect(typeof (api as Record<string, unknown>)[m]).toBe('function');
    }
  });
});
