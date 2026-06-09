import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@innova/ui': resolve(__dirname, 'packages/ui-components/src'),
      '@innova/design-tokens': resolve(__dirname, 'packages/design-tokens/src'),
      '@innova/error-catalog': resolve(__dirname, 'packages/error-catalog/src'),
      '@innova/supabase': resolve(__dirname, 'packages/supabase/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
  },
});
