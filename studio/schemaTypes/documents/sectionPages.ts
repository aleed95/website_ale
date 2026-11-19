import { ThListIcon } from '@sanity/icons/ThList';
import { defineField, defineType } from 'sanity';

/**
 * Titles and introductions of the listing pages. One document per language
 * (sectionPages-it, sectionPages-en). The lists themselves are generated from content.
 */
export const sectionPages = defineType({
  name: 'sectionPages',
  title: 'Testi delle sezioni',
  type: 'document',
  icon: ThListIcon,
  fields: [
    defineField({ name: 'services', title: 'Servizi', type: 'sectionIntro', validation: (rule) => rule.required() }),
    defineField({ name: 'projects', title: 'Progetti', type: 'sectionIntro', validation: (rule) => rule.required() }),
    defineField({
      name: 'publications',
      title: 'Pubblicazioni',
      type: 'sectionIntro',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'articles', title: 'Articoli', type: 'sectionIntro', validation: (rule) => rule.required() }),
    defineField({ name: 'contact', title: 'Contatti', type: 'sectionIntro', validation: (rule) => rule.required() }),
    defineField({
      name: 'contactForm',
      title: 'Modulo di contatto',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'formTitle',
          title: 'Titolo sopra il modulo',
          type: 'string',
          description: 'Es.: "Scrivimi".',
        }),
        defineField({
          name: 'thanksTitle',
          title: 'Pagina di conferma — titolo',
          type: 'string',
          description: 'Mostrata dopo l’invio. Es.: "Grazie, messaggio ricevuto".',
        }),
        defineField({
          name: 'thanksText',
          title: 'Pagina di conferma — testo',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
  ],
  preview: {
    select: { id: '_id' },
    prepare: ({ id }) => ({
      title: `Testi delle sezioni — ${String(id).endsWith('-en') ? 'English' : 'Italiano'}`,
    }),
  },
});
