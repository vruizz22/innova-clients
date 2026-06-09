'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export function AuthForm({ mode }: { mode: Mode }): JSX.Element {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

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
          options: { data: { role }, emailRedirectTo: `${window.location.origin}/auth/callback` },
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
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700 text-xs font-black text-white">
          SP
        </div>
        <span className="text-base font-extrabold text-slate-800">SuperProfes</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">{sub}</p>

      {message ? (
        <div
          role="alert"
          className={[
            'mb-4 rounded-lg border px-3 py-2.5 text-sm',
            isError
              ? 'border-[#f5b8b8] bg-[#fff8f8] text-[#7a1a1a]'
              : 'border-mint-200 bg-mint-50 text-mint-800',
          ].join(' ')}
        >
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' ? (
          <div className="flex gap-2" role="group" aria-label="Rol">
            {(Object.keys(ROLE_LABELS) as SignupRole[]).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => setRole(r)}
                className={[
                  'min-h-[44px] flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                  role === r
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                ].join(' ')}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        ) : null}

        {mode !== 'reset' ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-600">Correo</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@colegio.cl"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </label>
        ) : null}

        {mode === 'login' || mode === 'register' || mode === 'reset' ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-600">Contraseña</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </label>
        ) : null}

        {mode === 'register' ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-600">Confirmar contraseña</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </label>
        ) : null}

        {mode === 'login' ? (
          <a href="/forgot" className="self-end text-sm font-semibold text-sky-600 hover:text-sky-700">
            ¿Olvidaste tu contraseña?
          </a>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-mint-600 text-base font-bold text-white shadow-pop transition hover:-translate-y-px disabled:opacity-70"
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

      <p className="mt-5 text-center text-sm text-slate-500">
        {mode === 'login' ? (
          <>
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Crea una
            </a>
          </>
        ) : (
          <a href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            ← Volver a iniciar sesión
          </a>
        )}
      </p>
    </div>
  );
}
