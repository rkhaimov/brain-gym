import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { build, mergeConfig } from 'vite';
import type { InlineConfig } from 'vite';

import applicationViteConfig from '../../../../vite.config.js';

const testApplicationDirectory = resolve('dist/test-application');

const testApplicationConfig = {
  configFile: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  logLevel: 'warn',
  mode: 'test',
  build: {
    copyPublicDir: false,
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      cssFileName: 'application',
      entry: resolve('src/test/browser/runtime/app-bundle.tsx'),
      fileName: 'application',
      formats: ['es'],
    },
    minify: false,
    outDir: testApplicationDirectory,
    reportCompressedSize: false,
    rolldownOptions: {
      output: { codeSplitting: false },
    },
    sourcemap: false,
    target: 'esnext',
  },
} satisfies InlineConfig;

export default async function setup(): Promise<void> {
  if (
    process.env['SKIP_TEST_APPLICATION_BUILD'] === 'true' &&
    existsSync(testApplicationDirectory)
  ) {
    return;
  }
  await build(mergeConfig(applicationViteConfig, testApplicationConfig));
}
