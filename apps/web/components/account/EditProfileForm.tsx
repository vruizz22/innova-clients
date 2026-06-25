'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@innova/supabase/client';

/**
 * Inline editor for the display name. Persists to Supabase
 * `user_metadata.full_name`, then refreshes the route so the header + profile
 * pick up the new name on the next server render.
 */
export function EditProfileForm({ initialName }: { initialName: string }): JSX.Element {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const dirty = name.trim() !== initialName.trim() && name.trim().length > 0;

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!dirty) return;
    setStatus('saving');
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (error) {
      setStatus('error');
      return;
    }
    setStatus('saved');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1.5">
      <label htmlFor="full-name" className="text-sm font-semibold text-ink-muted">
        Nombre
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="full-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus('idle');
          }}
          autoComplete="name"
          className="h-11 flex-1 rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
        <button
          type="submit"
          disabled={!dirty || status === 'saving'}
          className="h-11 rounded-xl bg-brand px-5 text-sm font-bold text-brand-fg transition-all hover:bg-brand-hover active:scale-[0.99] disabled:opacity-50"
        >
          {status === 'saving' ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
      {status === 'saved' ? (
        <span className="text-sm font-medium" style={{ color: 'var(--success-fg)' }}>
          Nombre actualizado.
        </span>
      ) : null}
      {status === 'error' ? (
        <span className="text-sm font-medium" style={{ color: 'var(--error-fg)' }}>
          No se pudo guardar. Intenta de nuevo.
        </span>
      ) : null}
    </form>
  );
}
