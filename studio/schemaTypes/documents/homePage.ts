import { HomeIcon } from '@sanity/icons/Home';
import { defineField, defineType } from 'sanity';

/**
 * Home page. One document per language with fixed IDs (homePage-it, homePage-en).
 * Services and latest articles are listed automatically; projects and publications
 * are hand-picked here.
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Apertura', default: true },
    { name: 'sections', title: 'Sezioni' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Immagine di apertura',
      type: 'accessibleImage',
      group: 'hero',
      description: 'Foto orizzontale di grande formato (almeno 2400 px di larghezza).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroEyebrow',
      title: 'Etichetta sopra il titolo',
      type: 'string',
      group: 'hero',
      description: 'Facoltativa, breve. Es.: "Naturalista".',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Titolo',
      type: 'string',
      group: 'hero',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'heroText',
      title: 'Testo introduttivo',
      type: 'text',
      rows: 3,
      group: 'hero',
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: 'introTitle',
      title: 'Presentazione — titolo',
      type: 'string',
      group: 'sections',
    }),
    defineField({
      name: 'introText',
      title: 'Presentazione — testo breve',
      type: 'text',
      rows: 4,
      group: 'sections',
      description: 'Due o tre frasi; il testo completo è nella pagina "Chi sono".',
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Progetti in evidenza',
      type: 'array',
      group: 'sections',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
          // Only projects in this page's language (the document ID ends with -it / -en).
          options: {
            filter: ({ document }) => ({
              filter: 'language == $language',
              params: { language: document._id.endsWith('-en') ? 'en' : 'it' },
            }),
          },
        },
      ],
      validation: (rule) => rule.max(6).unique(),
    }),
    defineField({
      name: 'featuredPublications',
      title: 'Pubblicazioni in evidenza',
      type: 'array',
      group: 'sections',
      of: [{ type: 'reference', to: [{ type: 'publication' }] }],
      validation: (rule) => rule.max(4).unique(),
    }),
    defineField({
      name: 'ctaTitle',
      title: 'Invito al contatto — titolo',
      type: 'string',
      group: 'sections',
      description: 'Es.: "Hai un progetto in mente?"',
    }),
    defineField({
      name: 'ctaText',
      title: 'Invito al contatto — testo',
      type: 'text',
      rows: 2,
      group: 'sections',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Invito al contatto — testo del bottone',
      type: 'string',
      group: 'sections',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'heroTitle', id: '_id' },
    prepare: ({ title, id }) => ({
      title: `Home — ${String(id).endsWith('-en') ? 'English' : 'Italiano'}`,
      subtitle: title,
    }),
  },
});
