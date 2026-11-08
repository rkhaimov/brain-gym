import { test as baseTest, vi } from 'vitest';

import { createProductServiceMock } from '@/shared/gen/ceramics/v1/product_test.js';
import type { ProductServiceSpies } from '@/shared/gen/ceramics/v1/product_test.js';
import { screencastFixture } from './screencast-fixture.js';

interface BrowserFixtures {
  readonly productService: ProductServiceSpies;
}

type TestApplication = typeof import('./app-bundle.js');

async function loadTestApplication(): Promise<TestApplication> {
  let application = window.testApplication;
  await vi.waitFor(() => {
    application = window.testApplication;
    if (application === undefined) {
      throw new Error(
        window.testApplicationLoadError ?? 'Prebuilt browser test application has not loaded',
      );
    }
  });
  if (application === undefined) {
    throw new Error('Prebuilt browser test application did not load');
  }
  return application;
}

export const test = baseTest
  .extend<BrowserFixtures>({
    productService: [
      async ({ task: _task }, use) => {
        const service = createProductServiceMock();
        const application = await loadTestApplication();
        application.overrideTransport(service.transport);
        await use(service.spies);
      },
      { auto: true },
    ],
  })
  .extend('screencast', screencastFixture);
