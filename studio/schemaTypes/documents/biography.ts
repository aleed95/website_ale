import { UserIcon } from '@sanity/icons/User';
import { defineField, defineType } from 'sanity';
import { emphasisHint } from '../../lib/text';

/** "Chi sono / About" page. One document per language (biography-it, biography-en). */
export const biography = defineType({
  name: 'biography',
  title: 'Chi sono',
  type: 'document',
  icon: UserIcon,
  groups: [
    { name: 'intro', title: 'Presentazione', default: true },
    { name: 'path', title: 'Percorso' },
    { name: 'skills', title: 'Competenze e titoli' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo della pagina',
      type: 'string',
      group: 'intro',
      description: emphasisHint,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introduction',
      title: 'Introduzione',
      type: 'text',
      rows: 4,
      group: 'intro',
      description: 'Il paragrafo di apertura, accanto alla foto.',
      validation: (rule) => rule.required().max(600),
    }),
    defineField({
      name: 'profileImage',
      title: 'Foto profilo',
      type: 'accessibleImage',
      group: 'intro',
      description: 'Ritratto verticale, almeno 1200 px di altezza.',
    }),
    defineField({
      name: 'body',
      title: 'Biografia completa',
      type: 'blockContent',
      group: 'intro',
    }),
    defineField({
      name: 'education',
      title: 'Formazione',
      type: 'array',
      group: 'path',
      of: [{ type: 'timelineEntry' }],
      description: 'Sul sito appariranno dalla più recente.',
    }),
    defineField({
      name: 'experience',
      title: 'Esperienza professionale',
      type: 'array',
      group: 'path',
      of: [{ type: 'timelineEntry' }],
    }),
    defineField({
      name: 'skills',
      title: 'Competenze',
      type: 'array',
      group: 'skills',
      of: [{ type: 'skillGroup' }],
    }),
    defineField({
      name: 'qualifications',
      title: 'Certificazioni, abilitazioni e riconoscimenti',
      type: 'array',
      group: 'skills',
      of: [{ type: 'qualification' }],
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { id: '_id', title: 'title' },
    prepare: ({ id, title }) => ({
      title: `Chi sono — ${String(id).endsWith('-en') ? 'English' : 'Italiano'}`,
      subtitle: title,
    }),
  },
});
