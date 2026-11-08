import 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    mouseMove(x: number, y: number): Promise<void>;
    screencastStart(filePath: string, title: string, description: string): Promise<void>;
    screencastStop(): Promise<void>;
  }
}
