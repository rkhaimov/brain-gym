import { expect } from 'vitest';

import {
  formatRussianCurrency,
  formatRussianCurrencyInput,
  formatRussianDate,
  parseRussianDate,
  parseRussianRubles,
} from '@/client/lib/localization.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Russian display formats', () => {
  test('formats and parses reporting dates without timezone conversion', () => {
    expect(formatRussianDate('2026-11-01')).toBe('01.11.2026');
    expect(parseRussianDate('01.11.2026')).toBe('2026-11-01');
    expect(parseRussianDate('31.02.2026')).toBeUndefined();
  });

  test('formats and parses ruble values with kopeck precision', () => {
    expect(formatRussianCurrency(123_456)).toMatch(/^1\s234,56\s₽$/);
    expect(formatRussianCurrencyInput(123_456)).toMatch(/^1\s234,56$/);
    expect(parseRussianRubles('1 234,56')).toBe(123_456);
    expect(parseRussianRubles('1234.5 ₽')).toBe(123_450);
    expect(parseRussianRubles('12,345')).toBeUndefined();
  });
});
