import { describe, it, expect } from 'vitest';
import { createApiClient } from './index';

describe('api-client v9 dashboard methods', () => {
  it('exposes the C11/C12 teacher + parent methods', () => {
    const api = createApiClient({ baseUrl: 'http://x', getToken: async () => null });
    for (const m of [
      'getClassroomMastery',
      'getCourseHeatmap',
      'listChildren',
      'getChildSummary',
      'getGuideResultsMatrix',
      'getSubmissionDetail',
      'overrideSubmissionError',
    ] as const) {
      expect(typeof (api as Record<string, unknown>)[m]).toBe('function');
    }
  });
});
