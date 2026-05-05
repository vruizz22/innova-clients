'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createApiClient } from '@components/api-client';
import { getAccessToken, getStoredSession } from '@shared/auth-session';
import { getPublicRuntimeConfig } from '@shared/runtime-config';

export default function JoinPage(): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';

  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: runtimeConfig.apiUrl,
        getAccessToken,
      }),
    [runtimeConfig.apiUrl],
  );

  const [status, setStatus] = useState<'loading' | 'joining' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [classroomName, setClassroomName] = useState('');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setMessage('Código de invitación no encontrado en la URL.');
      return;
    }

    const session = getStoredSession();

    if (!session) {
      // Not logged in — save code and redirect to login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingJoinCode', code);
        router.replace(`/login?redirect=/join?code=${encodeURIComponent(code)}`);
      }
      return;
    }

    if (session.user.role !== 'student') {
      setStatus('error');
      setMessage('Solo los alumnos pueden unirse a un classroom con este link.');
      return;
    }

    setStatus('joining');

    void apiClient
      .joinClassroom({ code })
      .then((classroom) => {
        setClassroomName(classroom.name);
        setStatus('success');
        // Redirect to practice home after 2s
        setTimeout(() => {
          router.replace('/practice');
        }, 2000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'No se pudo unir al classroom',
        );
      });
  }, [apiClient, code, router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {status === 'loading' && <p>Verificando sesión...</p>}

      {status === 'joining' && (
        <div>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Uniéndote al classroom...
          </p>
          <p style={{ color: 'var(--fg-3)' }}>Un momento, por favor.</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ¡Te uniste exitosamente!
          </p>
          <p style={{ color: 'var(--fg-2)' }}>
            Ahora eres parte de <strong>{classroomName}</strong>. Redirigiendo...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--mastery-weak, #dc2626)',
              marginBottom: '0.5rem',
            }}
          >
            No se pudo unir al classroom
          </p>
          <p style={{ color: 'var(--fg-2)', marginBottom: '1.5rem' }}>{message}</p>
          <a
            href="/practice"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              background: 'var(--accent, #2F8DBA)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Ir a Ejercicios
          </a>
        </div>
      )}
    </main>
  );
}
