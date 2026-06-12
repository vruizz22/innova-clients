import type { Page } from '@playwright/test';
import type { TestUser } from './fixtures/users';

/**
 * Logs in through the real Supabase-backed auth form and waits until we leave
 * /login. The AuthForm uses name="email" / name="password" inputs (see
 * apps/web/components/AuthForm.tsx). See docs/SMOKE_TESTING.md §7.
 */
export async function loginAs(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
