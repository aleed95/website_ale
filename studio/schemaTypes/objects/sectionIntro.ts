import { defineField, defineType } from 'sanity';
import { emphasisHint } from '../../lib/text';

/** Heading, introduction and SEO of a listing page (Servizi, Progetti…). */
export const sectionIntro = defineType({
  name: 'sectionIntro',
  title: 'Testi della sezione',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      description: emphasisHint,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Introduzione',
      type: 'text',
      rows: 3,
      description: 'Facoltativa. Breve testo sotto il titolo.',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
});
