import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { emphasisHint } from '../../lib/text';
import { seoLimits } from '../../lib/validation';
import { groups, languageField, slugField } from './_fields';

export const article = defineType({
  name: 'article',
  title: 'Articolo',
  type: 'document',
  icon: DocumentTextIcon,
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
      name: 'excerpt',
      title: 'Estratto',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Il riassunto mostrato nell’elenco degli articoli.',
      validation: (rule) => rule.required().max(seoLimits.excerpt),
    }),
    defineField({
      name: 'body',
      title: 'Testo',
      type: 'blockContent',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'accessibleImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data di pubblicazione',
      type: 'date',
      group: 'details',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autore',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'details',
    }),
    defineField({
      name: 'categories',
      title: 'Categorie',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })],
      validation: (rule) => rule.unique().max(3),
    }),
    defineField({
      name: 'tags',
      title: 'Tag',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Parole chiave libere. Scrivi un tag e premi Invio.',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    { title: 'Più recenti', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'publishedAt', media: 'coverImage', language: 'language' },
    prepare: ({ title, date, media, language }) => ({
      title,
      subtitle: [String(language ?? '').toUpperCase(), date].filter(Boolean).join(' · '),
      media,
    }),
  },
});
