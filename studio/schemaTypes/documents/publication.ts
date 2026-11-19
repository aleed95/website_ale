import { BookIcon } from '@sanity/icons/Book';
import { defineField, defineType } from 'sanity';

export const publicationTypes = [
  { title: 'Articolo scientifico', value: 'paper' },
  { title: 'Libro', value: 'book' },
  { title: 'Capitolo di libro', value: 'chapter' },
  { title: 'Report tecnico', value: 'report' },
  { title: 'Articolo divulgativo', value: 'popular' },
  { title: 'Atti di convegno', value: 'proceedings' },
  { title: 'Altro', value: 'other' },
] as const;

/**
 * Publication. NOT translated as a whole: titles of scientific works stay in their
 * original language; only the optional description has IT/EN versions.
 */
export const publication = defineType({
  name: 'publication',
  title: 'Pubblicazione',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      description: 'Nella lingua originale della pubblicazione.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publicationType',
      title: 'Tipologia',
      type: 'string',
      options: { list: [...publicationTypes] },
      initialValue: 'paper',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authors',
      title: 'Autori',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Nell’ordine della pubblicazione. Es.: "Dini A.", "Rossi M.".',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data di pubblicazione',
      type: 'date',
      description: 'Se conosci solo l’anno, usa il 1° gennaio.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publisher',
      title: 'Rivista / Editore',
      type: 'string',
    }),
    defineField({
      name: 'citationDetails',
      title: 'Volume, numero, pagine',
      type: 'string',
      description: 'Facoltativo. Es.: "12(3): 45–67".',
    }),
    defineField({
      name: 'doi',
      title: 'DOI',
      type: 'string',
      description: 'Solo il codice, es.: 10.1234/abcd.5678',
      validation: (rule) =>
        rule.regex(/^10\.\d{4,9}\/\S+$/, { name: 'DOI' }).error('Formato DOI non valido (deve iniziare con "10.").'),
    }),
    defineField({
      name: 'url',
      title: 'Link esterno',
      type: 'url',
      description: 'Facoltativo, se non c’è un DOI o per un PDF liberamente accessibile.',
    }),
    defineField({
      name: 'description',
      title: 'Descrizione',
      type: 'localeText',
      description: 'Facoltativa. Breve presentazione nelle due lingue.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Copertina',
      type: 'accessibleImage',
      description: 'Facoltativa, utile per i libri.',
    }),
  ],
  orderings: [{ title: 'Più recenti', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', publisher: 'publisher', date: 'publishedAt', media: 'coverImage' },
    prepare: ({ title, publisher, date, media }) => ({
      title,
      subtitle: [publisher, date ? String(date).slice(0, 4) : undefined].filter(Boolean).join(' · '),
      media,
    }),
  },
});
