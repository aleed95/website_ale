/**
 * Locale and route configuration.
 *
 * Italian is the default language and lives at the site root; English lives under /en/.
 * Section URLs are translated (/chi-sono/ ↔ /en/about/), so every link to a section must
 * go through `getRoutePath()` instead of being written by hand.
 */

export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'it';

/** BCP 47 tags used for <html lang>, hreflang and og:locale. */
export const localeTags: Record<Locale, { lang: string; og: string; label: string }> = {
  it: { lang: 'it', og: 'it_IT', label: 'Italiano' },
  en: { lang: 'en', og: 'en_GB', label: 'English' },
};

export const routeKeys = [
  'home',
  'about',
  'services',
  'projects',
  'publications',
  'articles',
  'contact',
] as const;
export type RouteKey = (typeof routeKeys)[number];

/** Path of each top-level section, per locale. Always with leading and trailing slash. */
const routes: Record<RouteKey, Record<Locale, string>> = {
  home: { it: '/', en: '/en/' },
  about: { it: '/chi-sono/', en: '/en/about/' },
  services: { it: '/servizi/', en: '/en/services/' },
  projects: { it: '/progetti/', en: '/en/projects/' },
  publications: { it: '/pubblicazioni/', en: '/en/publications/' },
  articles: { it: '/articoli/', en: '/en/articles/' },
  contact: { it: '/contatti/', en: '/en/contact/' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function getRoutePath(key: RouteKey, locale: Locale): string {
  return routes[key][locale];
}

/** Paths of one section in every locale — handy for language-switcher alternates. */
export function getRouteAlternates(key: RouteKey): Record<Locale, string> {
  return { ...routes[key] };
}

/** Path of a detail page (project, article…) inside a section. */
export function getDetailPath(key: 'projects' | 'articles' | 'services', locale: Locale, slug: string): string {
  return `${routes[key][locale]}${encodeURIComponent(slug)}/`;
}
