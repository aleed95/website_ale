/**
 * Presentation tool ("Modifica sul sito") wiring: which document belongs to which preview URL,
 * and where each document appears on the site. URLs mirror web/src/i18n/config.ts.
 */
import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

export const PREVIEW = '/anteprima';

const sections = {
  it: { home: '/', about: '/chi-sono/', services: '/servizi/', projects: '/progetti/', publications: '/pubblicazioni/', articles: '/articoli/', contact: '/contatti/' },
  en: { home: '/en/', about: '/en/about/', services: '/en/services/', projects: '/en/projects/', publications: '/en/publications/', articles: '/en/articles/', contact: '/en/contact/' },
} as const;
type Lang = keyof typeof sections;
const lang = (value: unknown): Lang => (value === 'en' ? 'en' : 'it');
const href = (path: string) => `${PREVIEW}${path}`;

export const mainDocuments = defineDocuments([
  ...(['it', 'en'] as const).flatMap((l) => [
    { route: href(sections[l].home), filter: `_id == "homePage-${l}"` },
    { route: href(sections[l].about), filter: `_id == "biography-${l}"` },
    ...(['services', 'projects', 'publications', 'articles', 'contact'] as const).map((key) => ({
      route: href(sections[l][key]),
      filter: `_id == "sectionPages-${l}"`,
    })),
    { route: href(`${sections[l].projects}:slug/`), filter: `_type == "project" && language == "${l}" && slug.current == $slug` },
    { route: href(`${sections[l].articles}:slug/`), filter: `_type == "article" && language == "${l}" && slug.current == $slug` },
  ]),
  { route: href('/en/:slug/'), filter: '_type == "page" && language == "en" && slug.current == $slug' },
  { route: href('/:slug/'), filter: '_type == "page" && language == "it" && slug.current == $slug' },
]);

const singleton = (titles: Record<Lang, string>, key: keyof (typeof sections)['it']) =>
  defineLocations({
    select: { id: '_id' },
    resolve: (doc) => {
      const l = lang(String(doc?.id ?? '').endsWith('-en') ? 'en' : 'it');
      return { locations: [{ title: titles[l], href: href(sections[l][key]) }] };
    },
  });

const detail = (key: 'projects' | 'articles' | null) =>
  defineLocations({
    select: { title: 'title', slug: 'slug.current', language: 'language' },
    resolve: (doc) => {
      if (!doc?.slug) return null;
      const l = lang(doc.language);
      const base = key ? sections[l][key] : l === 'en' ? '/en/' : '/';
      return {
        locations: [
          { title: String(doc.title ?? '').replace(/\*/g, ''), href: href(`${base}${doc.slug}/`) },
          ...(key ? [{ title: key === 'projects' ? 'Elenco progetti' : 'Elenco articoli', href: href(sections[l][key]) }] : []),
        ],
      };
    },
  });

export const locations: NonNullable<PresentationPluginOptions['resolve']>['locations'] = {
  homePage: singleton({ it: 'Home', en: 'Home (EN)' }, 'home'),
  biography: singleton({ it: 'Chi sono', en: 'About (EN)' }, 'about'),
  project: detail('projects'),
  article: detail('articles'),
  page: detail(null),
  service: defineLocations({
    select: { language: 'language' },
    resolve: (doc) => ({
      locations: [
        { title: 'Servizi', href: href(sections[lang(doc?.language)].services) },
        { title: 'Home', href: href(sections[lang(doc?.language)].home) },
      ],
    }),
  }),
  publication: defineLocations({
    locations: [
      { title: 'Pubblicazioni', href: href(sections.it.publications) },
      { title: 'Publications (EN)', href: href(sections.en.publications) },
    ],
  }),
  siteSettings: defineLocations({ locations: [{ title: 'Tutte le pagine (footer, contatti)', href: href('/') }] }),
  navigation: defineLocations({ locations: [{ title: 'Tutte le pagine (menu e footer)', href: href('/') }] }),
};
