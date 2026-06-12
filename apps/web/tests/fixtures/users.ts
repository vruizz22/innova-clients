/**
 * Smoke-test accounts (Supabase STAGING project, never production).
 * Passwords come from GitHub Secrets `SUPABASE_TEST_PASSWORDS` → env at run time;
 * never hardcode them. See docs/SMOKE_TESTING.md §4.
 */
export interface TestUser {
  readonly email: string;
  readonly password: string;
}

function pwd(key: string): string {
  return process.env[key] ?? '';
}

export const TEST_USERS: Record<'student' | 'teacher' | 'parent' | 'admin', TestUser> = {
  student: { email: 'smoke.student@superprofes.app', password: pwd('SMOKE_STUDENT_PASSWORD') },
  teacher: { email: 'smoke.teacher@superprofes.app', password: pwd('SMOKE_TEACHER_PASSWORD') },
  parent: { email: 'smoke.parent@superprofes.app', password: pwd('SMOKE_PARENT_PASSWORD') },
  admin: { email: 'smoke.admin@superprofes.app', password: pwd('SMOKE_ADMIN_PASSWORD') },
};
