import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ExcelJS from 'exceljs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDirectory = resolve(root, 'src/server/report-import/fixtures');

interface CellValues {
  readonly [column: number]: string | number;
}

function hierarchyRow(
  sheet: ExcelJS.Worksheet,
  rowNumber: number,
  label: string,
  indent: number,
  values: CellValues = {},
): void {
  const row = sheet.getRow(rowNumber);
  row.outlineLevel = indent / 2;
  row.getCell(1).value = label;
  row.getCell(1).alignment = { indent };
  for (const column of Object.keys(values)) {
    const value = values[Number(column)];
    if (value !== undefined) row.getCell(Number(column)).value = value;
  }
}

async function writeCurrentMultipleOutlets(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('TDSheet');
  sheet.getCell('A2').value = 'Параметры:';
  sheet.getCell('C2').value = 'Контрагент: Тестовый автор';
  sheet.getCell('B3').value = 'Период: 12.11.2026 - 12.11.2026';

  sheet.getCell('A5').value = 'Организация';
  sheet.getCell('D5').value = 'Кол';
  sheet.getCell('F5').value = 'Сумма продажи';
  sheet.getCell('H5').value = 'Сумма комитента';
  sheet.getCell('A6').value = 'Магазин';
  sheet.getCell('A7').value = 'Номенклатура';
  sheet.getCell('A8').value = 'Регистратор';
  hierarchyRow(sheet, 9, 'Тестовая организация', 0);
  hierarchyRow(sheet, 10, 'Магазин "Твоя Полка" (Пестеля)', 2);
  hierarchyRow(sheet, 11, ' Кольцо ', 4, { 4: 2, 6: 700, 8: 600 });
  hierarchyRow(sheet, 12, 'Продажа 000001 от 12.11.2026 12:00:00', 6, {
    4: 2,
    6: 700,
    8: 600,
  });
  hierarchyRow(sheet, 13, 'Итого', 0);

  sheet.getCell('A15').value = 'Организация';
  sheet.getCell('E15').value = 'Количество Остаток';
  sheet.getCell('G15').value = 'Цена';
  sheet.getCell('A16').value = 'Магазин';
  sheet.getCell('A17').value = 'Номенклатура';
  hierarchyRow(sheet, 18, 'Тестовая организация', 0);
  hierarchyRow(sheet, 19, 'Магазин "Твоя Полка" (Пестеля)', 2);
  hierarchyRow(sheet, 20, 'Кольцо ', 4, { 5: 5, 7: 350 });
  hierarchyRow(sheet, 21, 'Магазин "Твоя Полка" (Москва-4)', 2);
  hierarchyRow(sheet, 22, ' Кулон', 4, { 5: 3, 7: 450 });
  hierarchyRow(sheet, 23, 'Итого', 0);

  await workbook.xlsx.writeFile(resolve(fixtureDirectory, 'current-multiple-outlets.xlsx'));
}

async function writeLegacyMissingValues(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('TDSheet');
  sheet.getCell('C3').value = 'Период: 04.01.2025 - 04.01.2025';
  sheet.getCell('A5').value = 'Организация';
  sheet.getCell('G5').value = 'Кол';
  sheet.getCell('I5').value = 'Сумма продажи';
  hierarchyRow(sheet, 9, 'Тестовая организация', 0);
  hierarchyRow(sheet, 10, 'Магазин "Твоя Полка" (Санкт-Петербург_Петроградка)', 2);
  hierarchyRow(sheet, 11, 'Значок ', 4, { 7: 1, 9: 379.5 });
  sheet.getCell('A15').value = 'Организация';
  sheet.getCell('G15').value = 'Количество Остаток';
  hierarchyRow(sheet, 18, 'Тестовая организация', 0);
  hierarchyRow(sheet, 19, 'Магазин "Твоя Полка" (Санкт-Петербург_Петроградка)', 2);
  hierarchyRow(sheet, 20, 'Значок ', 4, { 7: 4 });
  await workbook.xlsx.writeFile(resolve(fixtureDirectory, 'legacy-missing-values.xlsx'));
}

function createMinimalWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('TDSheet');
  sheet.getCell('C3').value = 'Период: 01.11.2026 - 30.11.2026';
  sheet.getCell('A5').value = 'Организация';
  sheet.getCell('D5').value = 'Кол';
  sheet.getCell('F5').value = 'Сумма продажи';
  sheet.getCell('H5').value = 'Сумма комитента';
  hierarchyRow(sheet, 6, 'Магазин "Твоя Полка" (Пестеля)', 2);
  hierarchyRow(sheet, 7, 'Кольцо', 4, { 4: 2, 6: 700, 8: 600 });
  sheet.getCell('A10').value = 'Организация';
  sheet.getCell('E10').value = 'Количество Остаток';
  sheet.getCell('G10').value = 'Цена';
  hierarchyRow(sheet, 11, 'Магазин "Твоя Полка" (Пестеля)', 2);
  hierarchyRow(sheet, 12, 'Кольцо', 4, { 5: 5, 7: 350 });
  return workbook;
}

async function writeInvalidFixtures(): Promise<void> {
  const invalidPeriod = createMinimalWorkbook();
  const invalidPeriodSheet = invalidPeriod.getWorksheet('TDSheet');
  if (invalidPeriodSheet !== undefined) invalidPeriodSheet.getCell('C3').value = 'Период: никогда';
  await invalidPeriod.xlsx.writeFile(resolve(fixtureDirectory, 'invalid-period.xlsx'));

  const invalidNumeric = createMinimalWorkbook();
  const invalidNumericSheet = invalidNumeric.getWorksheet('TDSheet');
  if (invalidNumericSheet !== undefined) invalidNumericSheet.getCell('D7').value = 'две';
  await invalidNumeric.xlsx.writeFile(resolve(fixtureDirectory, 'invalid-numeric.xlsx'));

  const malformedHierarchy = createMinimalWorkbook();
  const malformedHierarchySheet = malformedHierarchy.getWorksheet('TDSheet');
  if (malformedHierarchySheet !== undefined) {
    malformedHierarchySheet.getCell('A6').value = 'Не магазин';
    malformedHierarchySheet.getCell('A6').alignment = { indent: 0 };
  }
  await malformedHierarchy.xlsx.writeFile(resolve(fixtureDirectory, 'malformed-hierarchy.xlsx'));

  const duplicateListing = createMinimalWorkbook();
  const duplicateListingSheet = duplicateListing.getWorksheet('TDSheet');
  if (duplicateListingSheet !== undefined) {
    hierarchyRow(duplicateListingSheet, 8, 'Кольцо', 4, { 4: 1, 6: 350, 8: 300 });
  }
  await duplicateListing.xlsx.writeFile(resolve(fixtureDirectory, 'duplicate-listing.xlsx'));

  const duplicateOutlet = createMinimalWorkbook();
  const duplicateOutletSheet = duplicateOutlet.getWorksheet('TDSheet');
  if (duplicateOutletSheet !== undefined) {
    hierarchyRow(duplicateOutletSheet, 8, 'Магазин "Твоя Полка" (Пестеля)', 2);
  }
  await duplicateOutlet.xlsx.writeFile(resolve(fixtureDirectory, 'duplicate-outlet.xlsx'));
}

await mkdir(fixtureDirectory, { recursive: true });
await writeCurrentMultipleOutlets();
await writeLegacyMissingValues();
await writeInvalidFixtures();
