'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@innova/ui';
import { createClient } from '@innova/supabase/client';
import { getUserRole, roleHome } from '@innova/supabase';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
type SignupRole = 'student' | 'teacher' | 'parent';

const ROLE_LABELS: Record<SignupRole, string> = {
  student: 'Alumno',
  teacher: 'Profesor/a',
  parent: 'Apoderado/a',
};

const TITLES: Record<Mode, { title: string; sub: string }> = {
  login: { title: 'Bienvenido de vuelta', sub: 'Ingresa con tu correo y contraseña.' },
  register: { title: 'Crear cuenta', sub: 'Elige tu rol para comenzar.' },
  forgot: { title: 'Recuperar contraseña', sub: 'Te enviaremos un enlace a tu correo.' },
  reset: { title: 'Nueva contraseña', sub: 'Define tu nueva contraseña.' },
};

const fieldClass =
  'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30';

/** Text field with a label rendered above the input (never placeholder-as-label). */
function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

/** Password field with a show/hide toggle (accessible, keyboard-operable). */
function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}): JSX.Element {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <Field label={label}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Mínimo 8 caracteres'}
          className={`${fieldClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9.88 9.88a3 3 0 0 0 4.24 4.24M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61M2 2l20 20"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          )}
        </button>
      </div>
    </Field>
  );
}

export function AuthForm({ mode }: { mode: Mode }): JSX.Element {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<SignupRole>('student');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { title, sub } = TITLES[mode];

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const redirect = params.get('redirect') ?? roleHome(getUserRole(data.user));
        router.replace(redirect);
        router.refresh();
        return;
      }

      if (mode === 'register') {
        if (password !== confirm) {
          setMessage('Las contraseñas no coinciden.');
          setIsError(true);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(roleHome(role));
          router.refresh();
        } else {
          setMessage('Revisa tu correo para confirmar la cuenta.');
        }
        return;
      }

      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset`,
        });
        if (error) throw error;
        setMessage('Si existe una cuenta con ese correo, enviamos un enlace de recuperación.');
        return;
      }

      // reset
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Contraseña actualizada. Redirigiendo…');
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error de autenticación.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <a
        href="/"
        className="mb-8 inline-flex items-center text-ink"
        aria-label="SuperProfes — inicio"
      >
        <Logo height={30} />
      </a>

      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mb-6 mt-1 text-sm text-ink-muted">{sub}</p>

      {message ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border px-3 py-2.5 text-sm"
          style={
            isError
              ? {
                  borderColor: 'var(--error-border)',
                  background: 'var(--error-bg)',
                  color: 'var(--error-fg)',
                }
              : {
                  borderColor: 'var(--success-fg)',
                  background: 'var(--success-bg)',
                  color: 'var(--success-fg)',
                }
          }
        >
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' ? (
          <div className="flex flex-col gap-1.5" role="group" aria-label="Rol">
            <span className="text-sm font-semibold text-ink-muted">Soy</span>
            <div className="flex gap-2">
              {(Object.keys(ROLE_LABELS) as SignupRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={[
                    'min-h-[44px] flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                    role === r
                      ? 'border-brand bg-canvas-student text-brand'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                  ].join(' ')}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {mode === 'register' ? (
          <Field label="Nombre">
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre y apellido"
              className={fieldClass}
            />
          </Field>
        ) : null}

        {mode !== 'reset' ? (
          <Field label="Correo">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@colegio.cl"
              className={fieldClass}
            />
          </Field>
        ) : null}

        {mode === 'login' || mode === 'register' || mode === 'reset' ? (
          <PasswordField
            label="Contraseña"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        ) : null}

        {mode === 'register' ? (
          <PasswordField
            label="Confirmar contraseña"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
          />
        ) : null}

        {mode === 'login' ? (
          <a
            href="/forgot"
            className="self-end text-sm font-semibold text-brand hover:text-brand-hover"
          >
            ¿Olvidaste tu contraseña?
          </a>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 h-12 rounded-xl bg-brand text-base font-bold text-brand-fg shadow-card transition-all hover:bg-brand-hover active:scale-[0.99] disabled:opacity-60"
        >
          {loading
            ? '…'
            : mode === 'register'
            ? 'Crear cuenta'
            : mode === 'login'
            ? 'Entrar'
            : mode === 'reset'
            ? 'Cambiar contraseña'
            : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        {mode === 'login' ? (
          <>
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-semibold text-brand hover:text-brand-hover">
              Crea una
            </a>
          </>
        ) : (
          <a href="/login" className="font-semibold text-brand hover:text-brand-hover">
            ← Volver a iniciar sesión
          </a>
        )}
      </p>
    </div>
  );
}
