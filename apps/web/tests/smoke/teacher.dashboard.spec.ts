import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';
import { loginAs } from '../visual.utils';

// Maps to Design System: preview/teacher/dashboard.png + class-detail.png.
test.describe('teacher.dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USERS.teacher);
  });

  test('course grid renders and matches the design system', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-root"]');
    await expect(page).toHaveScreenshot('teacher-dashboard.png', { fullPage: true });
  });

  test('opening a course shows the mastery heatmap', async ({ page }) => {
    await page.goto('/dashboard');
    const firstCourse = page.locator('[data-testid="course-card"]').first();
    await firstCourse.click();
    await page.waitForSelector('[data-testid="classroom-heatmap"]');
    await expect(page.locator('[data-testid="classroom-heatmap"]')).toBeVisible();
  });
});

// Maps to Design System: preview/teacher/exercise-bank (v8 C3).
test.describe('teacher.exercise-bank', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USERS.teacher);
  });

  test('exercise bank renders the item grid', async ({ page }) => {
    await page.goto('/exercise-bank');
    await page.waitForSelector('[data-testid="exercise-bank-root"]');
    await expect(page).toHaveScreenshot('teacher-exercise-bank.png', { fullPage: true });
  });
});
