import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'server',
    environment: 'node',
    globals: true,
    include: ['server/__tests__/**/*.test.{js,ts}'],
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
