/** Maps a preview path (without the /anteprima prefix) to what should be rendered. */
import { getContactThanksPath, getRoutePath, locales, routeKeys, type Locale, type RouteKey } from '@/i18n/config';

export type PreviewTarget =
  | { kind: 'section'; locale: Locale; key: RouteKey }
  | { kind: 'project' | 'article'; locale: Locale; slug: string }
  | { kind: 'thanks'; locale: Locale }
  | { kind: 'page'; locale: Locale; slug: string };

export function resolvePreviewPath(rawPath: string): PreviewTarget | null {
  const path = `/${rawPath.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');

  for (const locale of locales) {
    for (const key of routeKeys) {
      if (path === getRoutePath(key, locale)) return { kind: 'section', locale, key };
    }
    if (path === getContactThanksPath(locale)) return { kind: 'thanks', locale };
    for (const key of ['projects', 'articles'] as const) {
      const base = getRoutePath(key, locale);
      const rest = path.startsWith(base) ? path.slice(base.length).replace(/\/$/, '') : '';
      if (rest && !rest.includes('/')) {
        return { kind: key === 'projects' ? 'project' : 'article', locale, slug: decodeURIComponent(rest) };
      }
    }
  }

  // Generic pages: /<slug>/ (Italian) and /en/<slug>/ (English).
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 1 && segments[0] !== 'en') return { kind: 'page', locale: 'it', slug: decodeURIComponent(segments[0]!) };
  if (segments.length === 2 && segments[0] === 'en') return { kind: 'page', locale: 'en', slug: decodeURIComponent(segments[1]!) };
  return null;
}
