import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

import { parseReportFile, ReportFileParseError } from './report-file-parser.js';

const fixtures = resolve(import.meta.dirname, 'fixtures');

describe('Твоя Полка Report file parser', () => {
  test('parses shifted headers and combines Sales and Stock outlets', async () => {
    const reportFile = await readFile(resolve(fixtures, 'current-multiple-outlets.xlsx'));

    await expect(parseReportFile(reportFile)).resolves.toEqual({
      outlets: [
        {
          name: 'Пестеля',
          sales: [
            {
              earningsKopecks: 60_000,
              listingName: 'Кольцо',
              salesValueKopecks: 70_000,
              unitsSold: 2,
            },
          ],
          stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 35_000, stockBalance: 5 }],
        },
        {
          name: 'Москва-4',
          sales: [],
          stockBalances: [{ listingName: 'Кулон', outletPriceKopecks: 45_000, stockBalance: 3 }],
        },
      ],
      periodEndDate: '2026-11-12',
      periodStartDate: '2026-11-12',
    });
  });

  test('uses zero for missing legacy Earnings and Stock price columns', async () => {
    const reportFile = await readFile(resolve(fixtures, 'legacy-missing-values.xlsx'));

    await expect(parseReportFile(reportFile)).resolves.toMatchObject({
      outlets: [
        {
          name: 'Санкт-Петербург_Петроградка',
          sales: [{ earningsKopecks: 0, salesValueKopecks: 37_950 }],
          stockBalances: [{ outletPriceKopecks: 0, stockBalance: 4 }],
        },
      ],
    });
  });

  test('combines repeated Stock listings at different prices', async () => {
    const reportFile = await readFile(resolve(fixtures, 'duplicate-stock-listing-prices.xlsx'));

    await expect(parseReportFile(reportFile)).resolves.toMatchObject({
      outlets: [
        {
          name: 'Пестеля',
          stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 45_000, stockBalance: 8 }],
        },
      ],
    });
  });

  test('omits a fully refunded Sales listing with a one-kopeck rounding residue', async () => {
    const reportFile = await readFile(resolve(fixtures, 'fully-refunded-sale.xlsx'));

    await expect(parseReportFile(reportFile)).resolves.toMatchObject({
      outlets: [{ name: 'Пестеля', sales: [] }],
    });
  });

  test.each([
    ['invalid-period.xlsx', 'ожидался отчётный период'],
    ['invalid-numeric.xlsx', 'ожидалось целое неотрицательное число'],
    ['malformed-hierarchy.xlsx', 'позиция находится вне магазина'],
    ['duplicate-listing.xlsx', 'позиция отчёта повторяется'],
    ['duplicate-outlet.xlsx', 'магазин повторяется'],
  ])('rejects invalid workbook %s', async (filename, message) => {
    const reportFile = await readFile(resolve(fixtures, filename));

    await expect(parseReportFile(reportFile)).rejects.toThrow(ReportFileParseError);
    await expect(parseReportFile(reportFile)).rejects.toThrow(message);
  });
});
