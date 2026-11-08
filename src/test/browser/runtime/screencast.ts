import { commands } from 'vitest/browser';
import type { Locator } from 'vitest/browser';

export type ScreencastColor = 'accent' | 'failure' | 'success';

export interface Screencast {
  highlight(
    locator: Locator,
    label: string,
    options?: Readonly<{ color?: ScreencastColor; duration?: number }>,
  ): Promise<void>;
  notify(
    message: string,
    options?: Readonly<{ color?: ScreencastColor; duration?: number }>,
  ): Promise<void>;
  pause(): Promise<void>;
  start(): Promise<void>;
  step(number: number, title: string): Promise<void>;
}

interface Accent {
  readonly color: string;
  readonly shadow: string;
}

const colors = new Map<ScreencastColor, Accent>([
  [
    'accent',
    {
      color: 'var(--primary)',
      shadow: 'color-mix(in srgb, var(--primary) 35%, transparent)',
    },
  ],
  [
    'failure',
    {
      color: 'var(--destructive)',
      shadow: 'color-mix(in srgb, var(--destructive) 35%, transparent)',
    },
  ],
  [
    'success',
    {
      color: 'var(--success)',
      shadow: 'color-mix(in srgb, var(--success) 35%, transparent)',
    },
  ],
]);

function accent(color: ScreencastColor): Accent {
  const selected = colors.get(color);
  if (selected === undefined) {
    throw new Error(`Unknown screencast color: ${color}`);
  }
  return selected;
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function overlayHost(): Readonly<{ host: HTMLElement; shadow: ShadowRoot }> {
  const host = document.createElement('div');
  host.dataset['screencastOverlay'] = '';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'closed' });
  document.documentElement.append(host);
  return { host, shadow };
}

export function createScreencast(
  filePath: string,
  title: string,
  description: string,
): Readonly<{ api: Screencast; dispose(): Promise<void> }> {
  let recording = false;
  let notification: HTMLElement | undefined;

  async function notify(
    message: string,
    options: Readonly<{ color?: ScreencastColor; duration?: number }> = {},
  ): Promise<void> {
    notification?.remove();
    const selected = accent(options.color ?? 'success');
    const { host, shadow } = overlayHost();
    notification = host;
    const badge = document.createElement('div');
    badge.textContent = message;
    badge.style.cssText = `position:fixed;top:18px;right:18px;max-width:calc(50vw - 36px);padding:8px 16px;border-radius:999px;color:white;background:${selected.color};box-shadow:0 8px 24px ${selected.shadow};font:600 15px/1.2 Inter,system-ui,sans-serif;`;
    shadow.append(badge);
    await wait(options.duration ?? 1_000);
    host.remove();
    if (notification === host) {
      notification = undefined;
    }
  }

  const api: Screencast = {
    async highlight(locator, label, options = {}) {
      const element = locator.element();
      const bounds = element.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) {
        throw new Error(`Cannot highlight hidden element: ${locator.asLocator()}`);
      }
      const selected = accent(options.color ?? 'success');
      const { host, shadow } = overlayHost();
      const box = document.createElement('div');
      box.style.cssText = `position:fixed;left:${Math.max(0, bounds.x - 6)}px;top:${Math.max(0, bounds.y - 6)}px;width:${bounds.width + 12}px;height:${bounds.height + 12}px;border:2px solid ${selected.color};border-radius:10px;box-shadow:0 0 24px ${selected.shadow};`;
      const badge = document.createElement('div');
      badge.textContent = label;
      badge.style.cssText = `position:fixed;left:${Math.max(12, bounds.x)}px;top:${Math.max(12, bounds.y - 40)}px;padding:5px 9px;border-radius:999px;color:white;background:${selected.color};font:700 12px/1.2 Inter,system-ui,sans-serif;`;
      shadow.append(box, badge);
      try {
        await wait(options.duration ?? 1_500);
      } finally {
        host.remove();
      }
    },
    notify,
    pause: () => wait(750),
    async start() {
      await commands.screencastStart(filePath, title, description);
      recording = true;
    },
    step: (number, stepTitle) => notify(`Шаг ${number}: ${stepTitle}`, { color: 'accent' }),
  };

  return {
    api,
    async dispose() {
      notification?.remove();
      notification = undefined;
      if (recording) {
        recording = false;
        await commands.screencastStop();
      }
    },
  };
}
