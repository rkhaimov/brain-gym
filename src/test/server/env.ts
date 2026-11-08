import { randomUUID } from 'node:crypto';

import { vi } from 'vitest';

import type { EnvService } from '../../server/env.js';

const DEFAULT_NOW_MS = new Date('2026-11-08T09:00:00.000Z').getTime();

export const testEnv = {
  now: vi.fn<EnvService['now']>(),
  randomUUID: vi.fn<EnvService['randomUUID']>(),
} satisfies EnvService;

export function resetTestEnv(): void {
  let nowMs = DEFAULT_NOW_MS;
  testEnv.now.mockReset().mockImplementation(() => new Date(nowMs++));
  testEnv.randomUUID.mockReset().mockImplementation(randomUUID);
}
