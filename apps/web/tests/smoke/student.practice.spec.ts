import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';
import { loginAs } from '../visual.utils';

// Maps to Design System: preview/practice/web-home.png (+ step-input, feedback).
test.describe('student.practice', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USERS.student);
  });

  test('practice home renders the assignment list', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="practice-root"]');
    await expect(page).toHaveScreenshot('student-practice-home.png', {
      fullPage: true,
    });
  });

  test('solve view renders the math keypad', async ({ page }) => {
    await page.goto('/practice');
    const firstSolve = page.locator('[data-testid="practice-solve-link"]').first();
    await firstSolve.click();
    await page.waitForSelector('[data-testid="math-input"]');
    await expect(page.locator('[data-testid="math-input"]')).toBeVisible();
  });

  test('scan entry point is reachable', async ({ page }) => {
    await page.goto('/practice');
    await page.locator('a[href="/scan"]').click();
    await page.waitForURL(/\/scan$/);
    await expect(page.locator('[data-testid="scan-root"]')).toBeVisible();
  });
});
