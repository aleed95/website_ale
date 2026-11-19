import { ImagesIcon } from '@sanity/icons/Images';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { emphasisHint } from '../../lib/text';
import { groups, languageField, sameLanguageFilter, slugField } from './_fields';

export const project = defineType({
  name: 'project',
  title: 'Progetto',
  type: 'document',
  icon: ImagesIcon,
  groups: [groups.content, groups.media, groups.details, groups.seo],
  fields: [
    languageField,
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      group: 'content',
      description: emphasisHint,
      validation: (rule) => rule.required(),
    }),
    slugField(),
    defineField({
      name: 'summary',
      title: 'Descrizione breve',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Mostrata nell’elenco dei progetti.',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'body',
      title: 'Descrizione completa',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'accessibleImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galleria',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({ type: 'accessibleImage' })],
      options: { layout: 'grid' },
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'details',
    }),
    defineField({
      name: 'startDate',
      title: 'Data di inizio',
      type: 'date',
      group: 'details',
      options: { dateFormat: 'MM/YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Data di fine',
      type: 'date',
      group: 'details',
      options: { dateFormat: 'MM/YYYY' },
      description: 'Lascia vuoto se il progetto è in corso.',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = (context.document as { startDate?: string } | undefined)?.startDate;
          return end && start && end < start ? 'La data di fine è precedente a quella di inizio.' : true;
        }),
    }),
    defineField({ name: 'client', title: 'Committente', type: 'string', group: 'details' }),
    defineField({ name: 'location', title: 'Luogo', type: 'string', group: 'details' }),
    defineField({
      name: 'relatedServices',
      title: 'Servizi collegati',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }], options: sameLanguageFilter })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'featured',
      title: 'In evidenza',
      type: 'boolean',
      group: 'details',
      initialValue: false,
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    { title: 'Più recenti', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
    { title: 'Titolo', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'startDate', media: 'coverImage', language: 'language' },
    prepare: ({ title, date, media, language }) => ({
      title,
      subtitle: [String(language ?? '').toUpperCase(), date ? String(date).slice(0, 7) : undefined]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
});
