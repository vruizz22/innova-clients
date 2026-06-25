import { redirect } from 'next/navigation';
import { createClient } from '@innova/supabase/server';
import { getUserDisplayName, getUserInitials, getUserRole, type AppRole } from '@innova/supabase';
import { getServerApi } from '@/lib/api.server';
import { EditProfileForm } from '@/components/account/EditProfileForm';

export const metadata = { title: 'Mi perfil' };

const ROLE_LABEL: Record<AppRole, string> = {
  student: 'Alumno',
  teacher: 'Profesor/a',
  parent: 'Apoderado/a',
  admin: 'Admin',
};

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default async function AccountPage(): Promise<JSX.Element> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = getUserRole(user);
  const name = getUserDisplayName(user);
  const initials = getUserInitials(name);

  // Enrich with the backend's typed /auth/me (profileId etc.). Tolerate outages.
  const me = await getServerApi().getMe();
  const profileId = me.ok ? me.data.profileId : null;
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <div className="mx-auto max-w-[640px]">
      <header className="mb-8 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-xl font-bold text-brand-fg">
          {initials}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{name}</h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink">Datos de la cuenta</h2>
        <p className="mb-5 mt-1 text-sm text-ink-muted">
          Tu nombre aparece en el panel y en las notificaciones.
        </p>
        <EditProfileForm initialName={name} />
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="mb-2 text-base font-semibold text-ink">Detalles</h2>
        <Row label="Correo" value={user.email ?? '—'} />
        <Row label="Rol" value={role ? ROLE_LABEL[role] : '—'} />
        {profileId ? <Row label="ID de perfil" value={profileId} /> : null}
        {memberSince ? <Row label="Miembro desde" value={memberSince} /> : null}
      </section>
    </div>
  );
}
