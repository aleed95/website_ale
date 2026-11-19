import { DocumentIcon } from '@sanity/icons/Document';
import { defineField, defineType } from 'sanity';
import { emphasisHint } from '../../lib/text';
import { reservedSlugs } from '../../lib/languages';
import { groups, languageField, slugField } from './_fields';

/**
 * Generic text page (Privacy policy, Cookie policy, future pages).
 * Published at /<slug>/ (Italian) and /en/<slug>/ (English).
 */
export const page = defineType({
  name: 'page',
  title: 'Pagina',
  type: 'document',
  icon: DocumentIcon,
  groups: [groups.content, groups.seo],
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
    {
      ...slugField(),
      validation: (rule) =>
        rule.required().custom((slug: { current?: string } | undefined) =>
          slug?.current && reservedSlugs.includes(slug.current)
            ? `"${slug.current}" è già usato da una sezione del sito: scegline un altro.`
            : true,
        ),
    },
    defineField({ name: 'body', title: 'Testo', type: 'blockContent', group: 'content' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language' },
    prepare: ({ title, slug, language }) => ({
      title,
      subtitle: `${String(language ?? '').toUpperCase()} · /${slug ?? ''}`,
    }),
  },
});
