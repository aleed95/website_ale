import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Rich text (Portable Text) used for biography, articles, projects and pages.
 * Kept deliberately small: headings, lists, emphasis, links and images.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Testo',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragrafo', value: 'normal' },
        { title: 'Titolo sezione', value: 'h2' },
        { title: 'Sottotitolo', value: 'h3' },
        { title: 'Citazione', value: 'blockquote' },
      ],
      lists: [
        { title: 'Elenco puntato', value: 'bullet' },
        { title: 'Elenco numerato', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Grassetto', value: 'strong' },
          { title: 'Corsivo', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Indirizzo (URL)',
                type: 'url',
                validation: (rule) =>
                  rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: 'accessibleImage' }),
    defineArrayMember({ type: 'video' }),
  ],
});
