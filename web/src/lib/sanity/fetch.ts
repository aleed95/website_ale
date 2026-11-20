/**
 * Data access for pages.
 *
 * Every page asks for its Sanity context with `useSanity(Astro.locals)`:
 * - static pages (build) get the published client;
 * - /anteprima/ pages get the preview client (drafts + click-to-edit), set by the
 *   middleware for that request only.
 * Global documents (settings, navigation, section texts) are memoised per context, so a
 * full build fetches them once per language.
 */
import type { SanityClient } from '@sanity/client';
import type { Locale } from '@/i18n/config';
import { sanityClient } from './client';
import { NAVIGATION_QUERY, SECTION_PAGES_QUERY, SITE_SETTINGS_QUERY } from './queries';
import type { NAVIGATION_QUERY_RESULT, SECTION_PAGES_QUERY_RESULT, SITE_SETTINGS_QUERY_RESULT } from './sanity.types';

export { sanityClient };

export interface SanityContext {
  client: SanityClient;
  /** True on /anteprima/ pages (drafts, click-to-edit). */
  preview: boolean;
  getSiteSettings: (language: Locale) => Promise<SITE_SETTINGS_QUERY_RESULT>;
  getNavigation: (language: Locale) => Promise<NAVIGATION_QUERY_RESULT>;
  getSectionPages: (language: Locale) => Promise<SECTION_PAGES_QUERY_RESULT>;
}

function memoByLocale<T>(load: (language: Locale) => Promise<T>, cache: boolean): (language: Locale) => Promise<T> {
  if (!cache) return load;
  const results = new Map<Locale, Promise<T>>();
  return (language) => {
    let pending = results.get(language);
    if (!pending) {
      pending = load(language);
      results.set(language, pending);
    }
    return pending;
  };
}

export function createSanityContext(client: SanityClient, preview: boolean): SanityContext {
  // Cache for the whole build, but never in `astro dev` (content must stay fresh) and
  // never across preview requests (each request gets its own context anyway).
  const cache = !import.meta.env.DEV;
  return {
    client,
    preview,
    getSiteSettings: memoByLocale((language) => client.fetch(SITE_SETTINGS_QUERY, { language }), cache),
    getNavigation: memoByLocale((language) => client.fetch(NAVIGATION_QUERY, { language }), cache),
    getSectionPages: memoByLocale((language) => client.fetch(SECTION_PAGES_QUERY, { language }), cache),
  };
}

const publishedContext = createSanityContext(sanityClient, false);

export function useSanity(locals: App.Locals): SanityContext {
  return locals.sanity ?? publishedContext;
}
