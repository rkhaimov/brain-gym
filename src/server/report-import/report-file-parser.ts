import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { Readable } from 'node:stream';

export interface ParsedReportSale {
  readonly earningsKopecks: number;
  readonly listingName: string;
  readonly salesValueKopecks: number;
  readonly unitsSold: number;
}

export interface ParsedReportStockBalance {
  readonly listingName: string;
  readonly outletPriceKopecks: number;
  readonly stockBalance: number;
}

export interface ParsedOutletReport {
  readonly name: string;
  readonly sales: readonly ParsedReportSale[];
  readonly stockBalances: readonly ParsedReportStockBalance[];
}

export interface ParsedReportFile {
  readonly outlets: readonly ParsedOutletReport[];
  readonly periodEndDate: string;
  readonly periodStartDate: string;
}

export class ReportFileParseError extends Error {
  constructor(
    readonly userMessage: string,
    readonly location?: string,
  ) {
    super(location === undefined ? userMessage : `${location}: ${userMessage}`);
    this.name = 'ReportFileParseError';
  }
}

async function withoutWorkbookDrawings(source: Buffer): Promise<Buffer> {
  const archive = await JSZip.loadAsync(source);
  archive.remove('xl/drawings');
  for (const [path, entry] of Object.entries(archive.files)) {
    if (!/^xl\/worksheets\/sheet\d+[.]xml$/u.test(path)) continue;
    const xml = await entry.async('string');
    archive.file(
      path,
      xml.replaceAll(/<(?:drawing|legacyDrawing|legacyDrawingHF)\b[^>]*\/>/gu, ''),
    );
  }
  return await archive.generateAsync({ type: 'nodebuffer' });
}

interface MutableOutletReport {
  readonly name: string;
  readonly sales: ParsedReportSale[];
  readonly stockBalances: MutableParsedReportStockBalance[];
}

interface MutableParsedReportStockBalance {
  readonly listingName: string;
  outletPriceKopecks: number;
  stockBalance: number;
}

function cellText(cell: ExcelJS.Cell): string | undefined {
  return typeof cell.value === 'string' ? cell.value : undefined;
}

function requireText(cell: ExcelJS.Cell, expected: string): string {
  const value = cellText(cell)?.trim();
  if (!value) throw new ReportFileParseError(`ожидалось ${expected}`, cell.address);
  return value;
}

function requireNonNegativeInteger(cell: ExcelJS.Cell, expected: string): number {
  const value = cell.value;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new ReportFileParseError(
      `ожидалось целое неотрицательное число: ${expected}`,
      cell.address,
    );
  }
  return value;
}

function rublesToKopecks(cell: ExcelJS.Cell, expected: string): number {
  const value = cell.value;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ReportFileParseError(`ожидалась неотрицательная сумма: ${expected}`, cell.address);
  }
  const kopecks = Math.round(value * 100);
  if (!Number.isSafeInteger(kopecks) || Math.abs(kopecks / 100 - value) > 0.000_001) {
    throw new ReportFileParseError(
      `ожидалась сумма с точностью до копеек: ${expected}`,
      cell.address,
    );
  }
  return kopecks;
}

function parseDate(value: string, location: string): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/u.exec(value);
  if (match === null) throw new ReportFileParseError('ожидалась дата ДД.ММ.ГГГГ', location);
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ReportFileParseError('ожидалась существующая календарная дата', location);
  }
  return `${yearText}-${monthText}-${dayText}`;
}

function parsePeriod(
  sheet: ExcelJS.Worksheet,
): Pick<ParsedReportFile, 'periodEndDate' | 'periodStartDate'> {
  const periodCells: ExcelJS.Cell[] = [];
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (cellText(cell)?.trim().startsWith('Период:') === true) periodCells.push(cell);
    });
  });
  if (periodCells.length !== 1) {
    throw new ReportFileParseError('ожидался один отчётный период');
  }
  const periodCell = periodCells[0];
  if (periodCell === undefined) throw new ReportFileParseError('ожидался один отчётный период');
  const value = requireText(periodCell, 'Период: ДД.ММ.ГГГГ - ДД.ММ.ГГГГ');
  const match = /^Период:\s*(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})$/u.exec(value);
  if (match === null) {
    throw new ReportFileParseError('ожидался отчётный период', periodCell.address);
  }
  const periodStartDate = parseDate(match[1] ?? '', periodCell.address);
  const periodEndDate = parseDate(match[2] ?? '', periodCell.address);
  if (periodEndDate < periodStartDate) {
    throw new ReportFileParseError('конец периода раньше начала', periodCell.address);
  }
  return { periodEndDate, periodStartDate };
}

function headerColumns(sheet: ExcelJS.Worksheet, rowNumber: number): Map<string, number> {
  const headers = new Map<string, number>();
  const row = sheet.getRow(rowNumber);
  row.eachCell({ includeEmpty: false }, (cell, column) => {
    if (typeof cell.value === 'string') headers.set(cell.value.trim(), column);
  });
  return headers;
}

function requiredHeader(headers: ReadonlyMap<string, number>, name: string, row: number): number {
  const column = headers.get(name);
  if (column === undefined) {
    throw new ReportFileParseError(`не найден столбец «${name}»`, `строка ${String(row)}`);
  }
  return column;
}

function outletName(cell: ExcelJS.Cell): string {
  const label = requireText(cell, 'Магазин "Твоя Полка" (<название>)');
  const match = /^Магазин\s+"Твоя Полка"\s*\(([^()]+)\)$/u.exec(label);
  const name = match?.[1]?.trim();
  if (!name) {
    throw new ReportFileParseError(
      'ожидался магазин «Твоя Полка» с названием в скобках',
      cell.address,
    );
  }
  return name;
}

function findOrCreateOutlet(
  outlets: Map<string, MutableOutletReport>,
  name: string,
): MutableOutletReport {
  const existing = outlets.get(name);
  if (existing !== undefined) return existing;
  const outlet = { name, sales: [], stockBalances: [] };
  outlets.set(name, outlet);
  return outlet;
}

function ensureUniqueListing(
  namesByOutlet: Map<string, Set<string>>,
  outletNameValue: string,
  listingName: string,
  location: string,
): void {
  const names = namesByOutlet.get(outletNameValue) ?? new Set<string>();
  if (names.has(listingName)) {
    throw new ReportFileParseError('позиция отчёта повторяется в разделе магазина', location);
  }
  names.add(listingName);
  namesByOutlet.set(outletNameValue, names);
}

function enterOutlet(
  outlets: Map<string, MutableOutletReport>,
  seenOutlets: Set<string>,
  cell: ExcelJS.Cell,
): MutableOutletReport {
  const name = outletName(cell);
  if (seenOutlets.has(name)) {
    throw new ReportFileParseError('магазин повторяется в разделе', cell.address);
  }
  seenOutlets.add(name);
  return findOrCreateOutlet(outlets, name);
}

function parseSalesSection(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  outlets: Map<string, MutableOutletReport>,
): void {
  const headers = headerColumns(sheet, startRow);
  const unitsColumn = requiredHeader(headers, 'Кол', startRow);
  const salesValueColumn = requiredHeader(headers, 'Сумма продажи', startRow);
  const earningsColumn = headers.get('Сумма комитента');
  const namesByOutlet = new Map<string, Set<string>>();
  const seenOutlets = new Set<string>();
  let outlet: MutableOutletReport | undefined;

  for (let rowNumber = startRow + 1; rowNumber < endRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const labelCell = row.getCell(1);
    const indent = labelCell.alignment?.indent ?? 0;
    if (indent === 2) {
      outlet = enterOutlet(outlets, seenOutlets, labelCell);
    } else if (indent === 4) {
      if (outlet === undefined) {
        throw new ReportFileParseError('позиция находится вне магазина', labelCell.address);
      }
      const listingName = requireText(labelCell, 'название позиции отчёта');
      const unitsCell = row.getCell(unitsColumn);
      const salesValueCell = row.getCell(salesValueColumn);
      const earningsCell = earningsColumn === undefined ? undefined : row.getCell(earningsColumn);
      const earningsValue = earningsCell?.value;
      if (
        unitsCell.value === null &&
        salesValueCell.value === null &&
        (earningsValue === null ||
          earningsValue === undefined ||
          (typeof earningsValue === 'number' && earningsValue >= -0.01 && earningsValue <= 0))
      ) {
        continue;
      }
      ensureUniqueListing(namesByOutlet, outlet.name, listingName, labelCell.address);
      const salesValueKopecks = rublesToKopecks(salesValueCell, 'Сумма продажи');
      const earningsKopecks =
        earningsColumn === undefined
          ? 0
          : rublesToKopecks(earningsCell ?? row.getCell(earningsColumn), 'Сумма комитента');
      if (earningsKopecks > salesValueKopecks) {
        throw new ReportFileParseError(
          'сумма комитента превышает сумму продажи',
          row.getCell(earningsColumn ?? salesValueColumn).address,
        );
      }
      outlet.sales.push({
        earningsKopecks,
        listingName,
        salesValueKopecks,
        unitsSold: requireNonNegativeInteger(unitsCell, 'Кол'),
      });
    }
  }
}

function parseStockSection(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  outlets: Map<string, MutableOutletReport>,
): void {
  const headers = headerColumns(sheet, startRow);
  const stockColumn = requiredHeader(headers, 'Количество Остаток', startRow);
  const priceColumn = headers.get('Цена');
  const balancesByOutlet = new Map<string, Map<string, MutableParsedReportStockBalance>>();
  const seenOutlets = new Set<string>();
  let outlet: MutableOutletReport | undefined;

  for (let rowNumber = startRow + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const labelCell = row.getCell(1);
    const indent = labelCell.alignment?.indent ?? 0;
    if (indent === 2) {
      outlet = enterOutlet(outlets, seenOutlets, labelCell);
    } else if (indent === 4) {
      if (outlet === undefined) {
        throw new ReportFileParseError('позиция находится вне магазина', labelCell.address);
      }
      const listingName = requireText(labelCell, 'название позиции отчёта');
      const outletPriceKopecks =
        priceColumn === undefined ? 0 : rublesToKopecks(row.getCell(priceColumn), 'Цена');
      const stockBalance = requireNonNegativeInteger(
        row.getCell(stockColumn),
        'Количество Остаток',
      );
      const balances =
        balancesByOutlet.get(outlet.name) ?? new Map<string, MutableParsedReportStockBalance>();
      const existing = balances.get(listingName);
      if (existing === undefined) {
        const balance = { listingName, outletPriceKopecks, stockBalance };
        balances.set(listingName, balance);
        balancesByOutlet.set(outlet.name, balances);
        outlet.stockBalances.push(balance);
      } else {
        const combinedStockBalance = existing.stockBalance + stockBalance;
        if (!Number.isSafeInteger(combinedStockBalance)) {
          throw new ReportFileParseError(
            'суммарное количество остатков превышает допустимое значение',
            labelCell.address,
          );
        }
        existing.stockBalance = combinedStockBalance;
        existing.outletPriceKopecks = Math.max(existing.outletPriceKopecks, outletPriceKopecks);
      }
    }
  }
}

export async function parseReportFile(source: Buffer): Promise<ParsedReportFile> {
  const workbook = new ExcelJS.Workbook();
  try {
    const workbookSource = await withoutWorkbookDrawings(source);
    await workbook.xlsx.read(Readable.from([workbookSource]));
  } catch (error) {
    throw new ReportFileParseError(
      `не удалось прочитать XLSX: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`,
    );
  }
  if (workbook.worksheets.length !== 1) {
    throw new ReportFileParseError('ожидался один лист XLSX');
  }
  const sheet = workbook.worksheets[0];
  if (sheet === undefined) throw new ReportFileParseError('лист XLSX отсутствует');
  const sectionHeaders: number[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (cellText(row.getCell(1))?.trim() === 'Организация') sectionHeaders.push(rowNumber);
  });
  if (sectionHeaders.length !== 2) {
    throw new ReportFileParseError('ожидались разделы продаж и остатков');
  }
  const salesHeader = sectionHeaders[0];
  const stockHeader = sectionHeaders[1];
  if (salesHeader === undefined || stockHeader === undefined) {
    throw new ReportFileParseError('ожидались разделы продаж и остатков');
  }
  const outlets = new Map<string, MutableOutletReport>();
  parseSalesSection(sheet, salesHeader, stockHeader, outlets);
  parseStockSection(sheet, stockHeader, outlets);
  if (outlets.size === 0) throw new ReportFileParseError('в файле нет магазинов');
  return { ...parsePeriod(sheet), outlets: [...outlets.values()] };
}
