const russianCurrency = new Intl.NumberFormat('ru-RU', {
  currency: 'RUB',
  minimumFractionDigits: 2,
  style: 'currency',
});

const russianCurrencyInput = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function isCalendarDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === isoDate;
}

/** Formats an API calendar date as the application-wide Russian DD.MM.YYYY display value. */
export function formatRussianDate(isoDate: string): string {
  if (!isCalendarDate(isoDate)) return isoDate;
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

/** Formats a local instant as the application-wide Russian date-and-time display value. */
export function formatRussianDateTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  if (Number.isNaN(date.getTime())) return '—';
  const twoDigits = (value: number) => value.toString().padStart(2, '0');
  return `${twoDigits(date.getDate())}.${twoDigits(date.getMonth() + 1)}.${date.getFullYear()}, ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

/** Converts a Russian DD.MM.YYYY field value to the API's timezone-free YYYY-MM-DD date. */
export function parseRussianDate(displayDate: string): string | undefined {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(displayDate.trim());
  if (match === null) return undefined;
  const isoDate = `${match[3]}-${match[2]}-${match[1]}`;
  return isCalendarDate(isoDate) ? isoDate : undefined;
}

/** Formats an integer kopeck amount for Russian read-only presentation. */
export function formatRussianCurrency(kopecks: number | undefined): string {
  return kopecks === undefined ? '—' : russianCurrency.format(kopecks / 100);
}

/** Formats an integer kopeck amount for editing; the currency marker belongs to the input chrome. */
export function formatRussianCurrencyInput(kopecks: number): string {
  return russianCurrencyInput.format(kopecks / 100);
}

/** Parses a Russian ruble field, accepting comma or dot decimals and optional grouping/currency marks. */
export function parseRussianRubles(value: string): number | undefined {
  const normalized = value.replace(/[\s₽]/g, '');
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(normalized);
  if (match === null) return undefined;
  const rubles = Number(match[1]);
  const kopecks = Number((match[2] ?? '').padEnd(2, '0'));
  const total = rubles * 100 + kopecks;
  return Number.isSafeInteger(total) ? total : undefined;
}
