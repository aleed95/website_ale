import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';

export const author = defineType({
  name: 'author',
  title: 'Autore',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'image', title: 'Foto', type: 'accessibleImage' }),
    defineField({ name: 'bio', title: 'Breve biografia', type: 'localeText' }),
  ],
  preview: { select: { title: 'name', media: 'image' } },
});
