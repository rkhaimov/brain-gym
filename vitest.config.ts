import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import { createBrowserProject } from './src/test/browser/runner/create-browser-project.js';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@artefacts': fileURLToPath(new URL('./artefacts', import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        test: {
          environment: 'node',
          fileParallelism: false,
          include: ['src/server/**/*.test.ts'],
          name: 'server',
          setupFiles: ['./src/test/server/setup.ts'],
        },
      },
      createBrowserProject(),
    ],
  },
});
