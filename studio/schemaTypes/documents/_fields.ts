import { defineField, type ReferenceFilterResolver } from 'sanity';
import { slugify } from '../../lib/text';
import { isUniqueSlugPerLanguage } from '../../lib/validation';

/** Language of a translated document. Written by the translation plugin; not editable. */
export const languageField = defineField({
  name: 'language',
  title: 'Lingua',
  type: 'string',
  readOnly: true,
  hidden: true,
});

/** URL slug generated from the title, unique per type and language. */
export function slugField(source = 'title') {
  return defineField({
    name: 'slug',
    title: 'Indirizzo della pagina (slug)',
    type: 'slug',
    // In "Contenuto", right under the title: without it the document cannot be published.
    group: 'content',
    description: 'L’ultima parte dell’indirizzo della pagina, es. …/articoli/la-vita-segreta-della-talpa. Dopo aver scritto il titolo premi "Generate" e si compila da solo.',
    options: { source, maxLength: 96, slugify, isUnique: isUniqueSlugPerLanguage },
    validation: (rule) => rule.required(),
  });
}

/** Reference filter: only documents in the same language as the one being edited. */
const sameLanguage: ReferenceFilterResolver = ({ document }) => ({
  filter: 'language == $language',
  params: { language: typeof document.language === 'string' ? document.language : 'it' },
});

export const sameLanguageFilter = { filter: sameLanguage };

export const groups = {
  content: { name: 'content', title: 'Contenuto', default: true },
  media: { name: 'media', title: 'Immagini' },
  details: { name: 'details', title: 'Dettagli' },
  seo: { name: 'seo', title: 'SEO' },
} as const;
