/** Help text for titles that support the italic emphasis of the brand manual. */
export const emphasisHint = 'Per mettere una parola in corsivo racchiudila tra asterischi: La vita segreta *delle dune*.';

/** URL slug: no asterisks, no accents ("Città *verdi*" → "citta-verdi"). */
export function slugify(input: string): string {
  return input
    .replace(/\*/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}
