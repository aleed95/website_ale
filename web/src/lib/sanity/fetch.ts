/**
 * Data access for pages. Wraps the typed client (`client.fetch` is overloaded by
 * TypeGen, so results are typed from the query string) and memoises the global
 * documents that every page needs, so a full build only fetches them once per language.
 */
import type { Locale } from '@/i18n/config';
import { sanityClient } from './client';
import { NAVIGATION_QUERY, SECTION_PAGES_QUERY, SITE_SETTINGS_QUERY } from './queries';
import type { NAVIGATION_QUERY_RESULT, SECTION_PAGES_QUERY_RESULT, SITE_SETTINGS_QUERY_RESULT } from './sanity.types';

export { sanityClient };

function memoByLocale<T>(load: (language: Locale) => Promise<T>): (language: Locale) => Promise<T> {
  const cache = new Map<Locale, Promise<T>>();
  return (language) => {
    let pending = cache.get(language);
    if (!pending) {
      pending = load(language);
      cache.set(language, pending);
    }
    return pending;
  };
}

export const getSiteSettings = memoByLocale(
  (language): Promise<SITE_SETTINGS_QUERY_RESULT> => sanityClient.fetch(SITE_SETTINGS_QUERY, { language }),
);

export const getNavigation = memoByLocale(
  (language): Promise<NAVIGATION_QUERY_RESULT> => sanityClient.fetch(NAVIGATION_QUERY, { language }),
);

export const getSectionPages = memoByLocale(
  (language): Promise<SECTION_PAGES_QUERY_RESULT> => sanityClient.fetch(SECTION_PAGES_QUERY, { language }),
);
