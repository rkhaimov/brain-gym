import { expect } from 'vitest';
import { commands, page } from 'vitest/browser';
import type { Locator } from 'vitest/browser';

export async function screenshot(locator: Locator, name: string): Promise<void> {
  await expect.element(locator).toBeVisible();
  await expect.element(page.getByText('Загружаем каталог…')).not.toBeInTheDocument();
  await commands.mouseMove(0, 0);
  if (import.meta.env['SCREENCAST'] === 'true') {
    return;
  }
  await expect.element(locator).toMatchScreenshot(name);
}
