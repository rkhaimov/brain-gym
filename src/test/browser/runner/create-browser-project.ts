import { resolve } from 'node:path';

import { playwright } from '@vitest/browser-playwright';
import type { TestProjectInlineConfiguration } from 'vitest/config';

import { browserCommands } from './commands.js';
import { createNeutralizeTestStylesPlugin } from './neutralize-test-styles.js';
import { createTestApplicationStaticPlugin } from './static-plugin.js';
import { createTesterHtmlPath } from './tester-html.js';
import { browserViewport } from './viewport.js';

const screencasting = process.env['SCREENCAST'] === 'true';

export function createBrowserProject(): TestProjectInlineConfiguration {
  return {
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'vitest',
        'vitest/browser',
        'vitest/internal/browser',
        '@vitest/browser/locators',
      ],
    },
    plugins: [createTestApplicationStaticPlugin(), createNeutralizeTestStylesPlugin()],
    test: {
      browser: {
        commands: browserCommands,
        enabled: true,
        expect: {
          toMatchScreenshot: {
            resolveScreenshotPath({
              arg,
              ext,
              root,
              screenshotDirectory,
              testFileDirectory,
              testFileName,
            }) {
              return resolve(
                root,
                testFileDirectory,
                screenshotDirectory,
                testFileName,
                `${arg}${ext}`,
              );
            },
          },
        },
        headless: true,
        instances: [{ browser: 'chromium' }],
        provider: playwright({
          contextOptions: { locale: 'ru-RU', timezoneId: 'Europe/Moscow' },
        }),
        screenshotFailures: false,
        testerHtmlPath: createTesterHtmlPath(),
        viewport: browserViewport,
      },
      env: { SCREENCAST: String(screencasting) },
      fileParallelism: !screencasting,
      globalSetup: ['./src/test/browser/runner/global-setup.ts'],
      include: ['browser-tests/**/*.test.ts'],
      name: 'browser',
      retry: process.env['CI'] === undefined ? 0 : 1,
      setupFiles: ['./src/test/browser/runtime/setup.ts'],
      strictTags: true,
      tags: [{ name: 'flaky', skip: process.env['SKIP_FLAKY_TESTS'] !== 'false' }],
    },
  };
}
