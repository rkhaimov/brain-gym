import { resolve } from 'node:path';

import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';

interface ActiveRecording {
  dispose(): Promise<void>;
}

const recordings = new WeakMap<BrowserCommandContext['page'], ActiveRecording>();

const mouseMove: BrowserCommand<[x: number, y: number]> = (context, x, y) =>
  context.page.mouse.move(x, y);

const screencastStart: BrowserCommand<
  [filePath: string, title: string, description: string]
> = async (context, filePath, title, description) => {
  const outputPath = resolve(filePath);
  const entryScreen = await context.page.screencast.showOverlay(`
    <style>
      .ceramics-screencast-entry {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 64px;
        color: white;
        background: linear-gradient(135deg, var(--primary), var(--accent-foreground));
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        text-align: center;
      }
      .ceramics-screencast-entry__description {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 700;
        opacity: 0.8;
      }
      .ceramics-screencast-entry__title {
        font-size: 48px;
        font-weight: 750;
      }
    </style>
    <div class="ceramics-screencast-entry">
      <div>
        <div class="ceramics-screencast-entry__description">${escapeHtml(description)}</div>
        <div class="ceramics-screencast-entry__title">${escapeHtml(title)}</div>
      </div>
    </div>
  `);
  const viewport = context.page.viewportSize();
  const recording = await context.page.screencast.start(
    viewport === null ? { path: outputPath } : { path: outputPath, size: viewport },
  );
  const actions = await context.page.screencast.showActions({
    cursor: 'pointer',
    duration: 900,
    fontSize: 14,
    position: 'top-left',
  });
  recordings.set(context.page, {
    async dispose() {
      try {
        await recording.dispose();
        process.stdout.write(`[screencast] Saved: ${outputPath}\n`);
      } finally {
        await actions.dispose();
      }
    },
  });
  await new Promise<void>((resolveDelay) => setTimeout(resolveDelay, 1_800));
  await entryScreen.dispose();
};

const screencastStop: BrowserCommand = async (context) => {
  const recording = recordings.get(context.page);
  recordings.delete(context.page);
  await recording?.dispose();
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}

export const browserCommands = { mouseMove, screencastStart, screencastStop };
