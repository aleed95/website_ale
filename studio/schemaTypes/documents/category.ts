import { TagIcon } from '@sanity/icons/Tag';
import { defineField, defineType } from 'sanity';

/** Category shared by articles and projects, with the name in both languages. */
export const category = defineType({
  name: 'category',
  title: 'Categoria',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nome',
      type: 'localeString',
      validation: (rule) =>
        rule.custom((value: { it?: string; en?: string } | undefined) =>
          value?.it && value?.en ? true : 'Inserisci il nome in entrambe le lingue.',
        ),
    }),
    defineField({
      name: 'slug',
      title: 'Identificativo',
      type: 'slug',
      options: { source: 'title.it', maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { it: 'title.it', en: 'title.en' },
    prepare: ({ it, en }) => ({ title: it ?? en ?? 'Senza nome', subtitle: en }),
  },
});
