import { defineField, defineType } from 'sanity';
import { languages } from '../../lib/languages';

/** Short text with one field per language, side by side (labels, captions…). */
export const localeString = defineType({
  name: 'localeString',
  title: 'Testo breve (IT / EN)',
  type: 'object',
  options: { columns: 1 },
  fields: languages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'string',
    }),
  ),
});

/** Longer plain text with one field per language (summaries, descriptions). */
export const localeText = defineType({
  name: 'localeText',
  title: 'Testo (IT / EN)',
  type: 'object',
  fields: languages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'text',
      rows: 3,
    }),
  ),
});
