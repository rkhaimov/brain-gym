import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          environment: 'node',
          fileParallelism: false,
          include: ['src/server/**/*.test.ts'],
          name: 'server',
        },
      },
    ],
  },
});
