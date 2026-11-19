import { CaseIcon } from '@sanity/icons/Case';
import { defineField, defineType } from 'sanity';
import { groups, languageField, slugField } from './_fields';

export const service = defineType({
  name: 'service',
  title: 'Servizio',
  type: 'document',
  icon: CaseIcon,
  groups: [groups.content, groups.media, groups.seo],
  fields: [
    languageField,
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    slugField(),
    defineField({
      name: 'summary',
      title: 'Descrizione breve',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Mostrata nelle schede dei servizi (home e pagina Servizi).',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'description',
      title: 'Descrizione completa',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'image',
      title: 'Immagine',
      type: 'accessibleImage',
      group: 'media',
      description: 'Facoltativa.',
    }),
    defineField({
      name: 'order',
      title: 'Ordine di visualizzazione',
      type: 'number',
      group: 'content',
      description: 'I numeri più bassi appaiono per primi.',
      initialValue: 10,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    { title: 'Ordine di visualizzazione', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Titolo', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'summary', media: 'image', language: 'language' },
    prepare: ({ title, subtitle, media, language }) => ({
      title,
      subtitle: `${String(language ?? '').toUpperCase()} · ${subtitle ?? ''}`,
      media,
    }),
  },
});
