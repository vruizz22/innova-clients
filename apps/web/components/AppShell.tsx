import type { ReactNode } from 'react';
import { createClient } from '@innova/supabase/server';
import { getUserRole, type AppRole } from '@innova/supabase';

type Area = 'student' | 'teacher' | 'parent' | 'admin';

const AREA_BG: Record<Area, string> = {
  student: 'bg-sky-50',
  parent: 'bg-mint-50',
  teacher: 'bg-slate-50',
  admin: 'bg-slate-50',
};

const ROLE_LABEL: Record<AppRole, string> = {
  student: 'Alumno',
  teacher: 'Profesor/a',
  parent: 'Apoderado/a',
  admin: 'Admin',
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

  return (
    <div className={`min-h-screen ${AREA_BG[area]}`}>
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-5">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-xs font-black text-white">
              SP
            </div>
            <span className="text-[15px] font-bold text-slate-900">
              Super<span className="text-sky-500">Profes</span>
            </span>
          </a>
          {role ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              {ROLE_LABEL[role]}
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            {user?.email ? (
              <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
            ) : null}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-5 py-8">{children}</main>
    </div>
  );
}
