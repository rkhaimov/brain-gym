import { describe, expect, test } from 'vitest';

import { extractYandexReportAttachments, isYandexReportFilename } from './yandex-report-mailbox.js';

describe('Yandex Report attachment matching', () => {
  test.each([
    'Отчёт по продажам.xlsx',
    'Отчет по продажам с 2026-11-05 по 2026-11-05.xlsx',
    '  ОТЧЁТ ПО ПРОДАЖАМ.XLSX  ',
  ])('accepts %s', (filename) => {
    expect(isYandexReportFilename(filename)).toBe(true);
  });

  test.each(['Продажи.xlsx', 'Отчёт по продажам.xls', 'Отчёт по продажам.xlsx.zip'])(
    'rejects %s',
    (filename) => {
      expect(isYandexReportFilename(filename)).toBe(false);
    },
  );

  test('extracts and transfer-decodes the matching XLSX from a complete message', async () => {
    const filename = 'Отчёт по продажам.xlsx';
    const encodedFilename = Buffer.from(filename).toString('base64');
    const contents = Buffer.from('synthetic-xlsx');
    const source = Buffer.from(
      [
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="fixture"',
        '',
        '--fixture',
        'Content-Type: text/plain; charset=utf-8',
        '',
        'Твоя полка',
        '--fixture',
        `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="=?UTF-8?B?${encodedFilename}?="`,
        `Content-Disposition: attachment; filename="=?UTF-8?B?${encodedFilename}?="`,
        'Content-Transfer-Encoding: base64',
        '',
        contents.toString('base64'),
        '--fixture--',
        '',
      ].join('\r\n'),
    );

    await expect(extractYandexReportAttachments(source)).resolves.toEqual([
      { filename, source: contents },
    ]);
  });
});
