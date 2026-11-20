import { stegaClean } from '@sanity/client/stega';

/**
 * Editors mark the emphasised word of a title with asterisks — "La vita segreta *delle dune*" —
 * rendered in Fraunces italic as in the brand manual (p.11).
 */
export interface EmphasisPart {
  text: string;
  em: boolean;
}

export function emphasisParts(value: string | null | undefined): EmphasisPart[] {
  if (!value) return [];
  return value
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.length > 2 && part.startsWith('*') && part.endsWith('*')
        ? { text: part.slice(1, -1), em: true }
        : { text: part, em: false },
    );
}

/** True when a CMS title says something more than a fixed label (ignores *emphasis*, case, spaces). */
export function differsFromLabel(title: string | null | undefined, label: string): boolean {
  const normalize = (value: string) => stripEmphasis(stegaClean(value)).trim().toLowerCase();
  return Boolean(title) && normalize(title!) !== normalize(label);
}

/** Plain text for <title>, meta tags and alt attributes. */
export function stripEmphasis(value: string | null | undefined): string {
  return (value ?? '').replace(/\*([^*]+)\*/g, '$1');
}
