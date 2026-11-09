import { expect, vi } from 'vitest';
import { commands } from 'vitest/browser';
import type { Locator, ScreenshotMatcherOptions } from 'vitest/browser';

type StabilizerOptions = {
  readonly noStableCursor?: boolean;
  readonly noTransientUIProtection?: boolean;
};

export async function screenshot(
  locator: Locator,
  name: string,
  options?: ScreenshotMatcherOptions & StabilizerOptions,
): Promise<void> {
  await expect.element(locator).toBeVisible();

  if (!options?.noTransientUIProtection) {
    await waitForTransientUIHidden(locator, options?.timeout ?? 5_000);
  }

  if (!options?.noStableCursor) {
    await commands.mouseMove(0, 0);
  }

  if (import.meta.env['SCREENCAST'] === 'true') {
    return;
  }

  await expect.element(locator).toMatchScreenshot(name, options);
}

async function waitForTransientUIHidden(locator: Locator, timeout: number): Promise<void> {
  await vi.waitFor(
    async () => {
      await vi.advanceTimersByTimeAsync(1_000);

      if (getVisibleTransientUI(locator) === 0) {
        return;
      }

      await expect.poll(() => getVisibleTransientUI(locator)).toBe(0);
      throw new Error('Detected transient UI hidden');
    },
    { interval: 50, timeout },
  );
}

function getVisibleTransientUI(locator: Locator): number {
  return locator
    .elements()
    .flatMap((root) => [
      ...(root.matches('[data-slot="skeleton"], [role="status"]') ? [root] : []),
      ...root.querySelectorAll('[data-slot="skeleton"], [role="status"]'),
    ])
    .filter((element) => element.checkVisibility({ visibilityProperty: true })).length;
}
