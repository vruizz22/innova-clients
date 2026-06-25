import type { ReactNode } from 'react';
import { Logo } from '@innova/ui';
import { createClient } from '@innova/supabase/server';
import { getUserRole, getUserDisplayName, roleHome, type AppRole } from '@innova/supabase';
import { NavLinks } from './shell/NavLinks';
import { ProfileMenu } from './shell/ProfileMenu';

type Area = 'student' | 'teacher' | 'parent' | 'admin';

// Canvas tint per area — token-backed, so each adapts in dark mode.
const AREA_BG: Record<Area, string> = {
  student: 'bg-canvas-student',
  parent: 'bg-canvas-parent',
  teacher: 'bg-canvas-teacher',
  admin: 'bg-canvas-teacher',
};

const ROLE_LABEL: Record<AppRole, string> = {
  student: 'Alumno',
  teacher: 'Profesor/a',
  parent: 'Apoderado/a',
  admin: 'Admin',
};

interface NavLink {
  readonly href: string;
  readonly label: string;
}

const AREA_NAV: Record<Area, readonly NavLink[]> = {
  student: [
    { href: '/practice', label: 'Práctica' },
    { href: '/guides', label: 'Guías' },
    { href: '/scan', label: 'Escanear' },
    { href: '/scans', label: 'Mis escaneos' },
    { href: '/join', label: 'Unirse' },
  ],
  teacher: [
    { href: '/dashboard', label: 'Resumen' },
    { href: '/classrooms', label: 'Alumnos' },
    { href: '/guides', label: 'Guías' },
    { href: '/exercise-bank', label: 'Banco' },
    { href: '/assign-practice', label: 'Asignar' },
    { href: '/alerts', label: 'Alertas' },
    { href: '/skills', label: 'Habilidades' },
    { href: '/error-search', label: 'Catálogo' },
  ],
  parent: [{ href: '/family', label: 'Mis hijos' }],
  admin: [
    { href: '/error-catalog', label: 'Catálogo' },
    { href: '/status', label: 'Sistema' },
  ],
};

export async function AppShell({
  area,
  children,
}: {
  area: Area;
  children: ReactNode;
}): Promise<JSX.Element> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = getUserRole(user);
  const displayName = getUserDisplayName(user);

  return (
    <div className={`min-h-screen ${AREA_BG[area]}`}>
      <header className="sticky top-0 z-sticky border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <a
            href={role ? roleHome(role) : '/'}
            className="flex items-center text-ink transition-opacity hover:opacity-80"
            aria-label="SuperProfes — inicio"
          >
            <Logo height={26} />
          </a>
          {role ? (
            <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              {ROLE_LABEL[role]}
            </span>
          ) : null}
          <div className="ml-auto">
            {user ? (
              <ProfileMenu
                name={displayName}
                email={user.email ?? ''}
                roleLabel={role ? ROLE_LABEL[role] : 'Cuenta'}
              />
            ) : (
              <a
                href="/login"
                className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
              >
                Iniciar sesión
              </a>
            )}
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-[1600px] items-center gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
          <NavLinks links={AREA_NAV[area]} />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
