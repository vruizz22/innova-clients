import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@innova/ui': resolve(__dirname, 'packages/ui-components/src'),
      '@innova/design-tokens': resolve(__dirname, 'packages/design-tokens/src'),
      '@innova/error-catalog': resolve(__dirname, 'packages/error-catalog/src'),
      '@innova/supabase': resolve(__dirname, 'packages/supabase/src'),
      '@innova/api-client': resolve(__dirname, 'packages/api-client/src'),
      '@innova/math-input': resolve(__dirname, 'packages/math-input/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    // Vitest owns *.test.ts(x). Playwright smoke specs use *.spec.ts under
    // apps/web/tests/smoke and must not be collected by Vitest.
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/tests/smoke/**'],
  },
});
