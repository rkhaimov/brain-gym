import { afterEach, beforeEach, vi } from 'vitest';
import { page } from 'vitest/browser';

import { browserViewport } from '../runner/viewport.js';

beforeEach(async () => {
  await page.viewport(browserViewport.width, browserViewport.height);
  vi.resetAllMocks();
  vi.useFakeTimers({
    now: new Date('2026-11-08T09:00:00.000Z'),
    shouldAdvanceTime: true,
    toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
  });
  localStorage.clear();
  sessionStorage.clear();
  window.testApplication?.queryClient.clear();
});

afterEach(() => {
  window.testApplication?.unmount();
  window.testApplication?.clearTransportOverride();
  vi.useRealTimers();
});

window.openApplicationRoute = async (path: string): Promise<void> => {
  window.history.replaceState(null, '', path);
  const application = window.testApplication;
  if (application === undefined) {
    throw new Error('Prebuilt browser test application has not loaded');
  }
  application.mount();
  await Promise.resolve();
};

declare global {
  interface Window {
    openApplicationRoute(path: string): Promise<void>;
    testApplication?: typeof import('./app-bundle.js');
    testApplicationLoadError?: string;
  }
}
