import { localeTags, type Locale } from '@/i18n/config';

/** Sanity `date` fields are plain YYYY-MM-DD: format them in UTC to avoid off-by-one days. */
function parseDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00Z`);
}

export function formatDate(value: string, locale: Locale, style: 'long' | 'month' | 'year' = 'long'): string {
  const options: Intl.DateTimeFormatOptions =
    style === 'year'
      ? { year: 'numeric' }
      : style === 'month'
        ? { month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(localeTags[locale].lang, { ...options, timeZone: 'UTC' }).format(parseDate(value));
}

/** "marzo 2024 – in corso" / "March 2024 – June 2025". */
export function formatPeriod(start: string, end: string | null | undefined, locale: Locale, ongoing: string): string {
  const from = formatDate(start, locale, 'month');
  return end ? `${from} – ${formatDate(end, locale, 'month')}` : `${from} – ${ongoing}`;
}

/** "2019–2023" / "2021–oggi" for biography timelines. */
export function formatYears(start: number | null | undefined, end: number | null | undefined, ongoing: string): string {
  if (!start) return end ? String(end) : '';
  if (end === start) return String(start);
  return `${start}–${end ?? ongoing}`;
}
