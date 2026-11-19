import { getDetailPath, getRoutePath, isLocale, locales, type Locale, type RouteKey } from '@/i18n/config';
import type { NAVIGATION_QUERY_RESULT } from './sanity/sanity.types';

type NavLink = NonNullable<NonNullable<NAVIGATION_QUERY_RESULT>['mainMenu']>[number];

export interface ResolvedLink {
  key: string;
  label: string;
  href: string;
  external: boolean;
}

/** Path of a generic page (privacy policy…): /<slug>/ or /en/<slug>/. */
export function getPagePath(locale: Locale, slug: string): string {
  return `${getRoutePath('home', locale)}${encodeURIComponent(slug)}/`;
}

/** Turns a CMS link into an href; returns null when it cannot be resolved (incomplete or untranslated). */
export function resolveNavLink(link: NavLink, locale: Locale): ResolvedLink | null {
  if (!link.label) return null;
  const base = { key: link._key, label: link.label };

  switch (link.linkType) {
    case 'internal':
      return link.internalPage
        ? { ...base, href: getRoutePath(link.internalPage as RouteKey, locale), external: false }
        : null;
    case 'page':
      return link.pageSlug ? { ...base, href: getPagePath(locale, link.pageSlug), external: false } : null;
    case 'external':
      return link.url ? { ...base, href: link.url, external: true } : null;
    default:
      return null;
  }
}

export function resolveNavLinks(links: readonly NavLink[] | null | undefined, locale: Locale): ResolvedLink[] {
  return (links ?? []).flatMap((link) => resolveNavLink(link, locale) ?? []);
}

type Translations = ReadonlyArray<{ language: string | null; slug: string | null }> | null | undefined;

/**
 * Alternates for a translated document (hreflang + language switcher). Only languages
 * that actually have a published translation are included.
 */
export function translationAlternates(
  translations: Translations,
  current: { locale: Locale; slug: string },
  toPath: (locale: Locale, slug: string) => string,
): Partial<Record<Locale, string>> {
  const alternates: Partial<Record<Locale, string>> = { [current.locale]: toPath(current.locale, current.slug) };
  for (const translation of translations ?? []) {
    if (isLocale(translation.language) && translation.slug && locales.includes(translation.language)) {
      alternates[translation.language] = toPath(translation.language, translation.slug);
    }
  }
  return alternates;
}

export const projectPath = (locale: Locale, slug: string) => getDetailPath('projects', locale, slug);
export const articlePath = (locale: Locale, slug: string) => getDetailPath('articles', locale, slug);
