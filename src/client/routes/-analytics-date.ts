export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function localCalendarDate(date: Date): string {
  const twoDigits = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

export function daysBefore(date: Date, days: number): Date {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - days);
  return previous;
}

export function currentDate(): Date {
  return new Date();
}
