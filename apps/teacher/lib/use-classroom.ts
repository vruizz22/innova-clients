'use client';

import { useEffect, useState } from 'react';
import type { createApiClient } from '@components/api-client';

type ApiClient = ReturnType<typeof createApiClient>;

/**
 * Fetches the first classroom for the authenticated teacher.
 * Returns null while loading, null if teacher has no classrooms.
 */
export function useFirstClassroomId(
  apiClient: ApiClient,
): { classroomId: string | null; loading: boolean; error: string } {
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const classrooms = await apiClient.getMyClassrooms();
        setClassroomId(classrooms[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el classroom');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [apiClient]);

  return { classroomId, loading, error };
}
