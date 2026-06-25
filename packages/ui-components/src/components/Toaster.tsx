'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Pre-configured sonner <Toaster> that tracks DS tokens.
 * Mount once near the root (e.g. inside <Providers>).
 * Call `toast.success / toast.error / toast.info` from anywhere in the client tree.
 */
export function Toaster(): JSX.Element {
  return (
    <SonnerToaster
      richColors
      position="bottom-center"
      gap={8}
      offset={20}
      toastOptions={{
        style: {
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--fg-1)',
          boxShadow: 'var(--shadow-pop)',
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
      }}
    />
  );
}
