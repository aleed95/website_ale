/** Website languages. Keep in sync with web/src/i18n/config.ts. */
export const languages = [
  { id: 'it', title: 'Italiano' },
  { id: 'en', title: 'English' },
] as const;

export type LanguageId = (typeof languages)[number]['id'];

export const defaultLanguage: LanguageId = 'it';

/**
 * First URL segment of every website section, in both languages (see
 * web/src/i18n/config.ts). Generic pages cannot use these slugs.
 */
export const reservedSlugs: readonly string[] = [
  'en', 'chi-sono', 'servizi', 'progetti', 'pubblicazioni', 'articoli', 'contatti',
  'about', 'services', 'projects', 'publications', 'articles', 'contact',
  '404', 'robots.txt', 'sitemap-index.xml', '_astro',
];

/** Document types translated as separate documents (one per language). */
export const translatedDocumentTypes = ['service', 'project', 'article', 'page'] as const;

/** Single documents that exist once per language, with fixed IDs: `<type>-<language>`. */
export const perLanguageSingletonTypes = ['homePage', 'biography', 'sectionPages'] as const;

/** Single documents shared by both languages. */
export const globalSingletonTypes = ['siteSettings', 'navigation'] as const;

export const singletonTypes: readonly string[] = [...perLanguageSingletonTypes, ...globalSingletonTypes];

export function perLanguageSingletonId(type: (typeof perLanguageSingletonTypes)[number], language: LanguageId): string {
  // Note: IDs must not contain dots, which Sanity reserves for private documents.
  return `${type}-${language}`;
}
