import { HomeIcon } from '@sanity/icons/Home';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { emphasisHint } from '../../lib/text';

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
    { name: 'identity', title: 'Ambiti, numeri e manifesto' },
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
      description: emphasisHint,
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
      description: emphasisHint,
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
      name: 'servicesTitle',
      title: 'Servizi — titolo grande',
      type: 'string',
      group: 'sections',
      description: `Facoltativo. Sopra compare la scritta piccola «Servizi». Es.: "Cosa posso fare *per te*". ${emphasisHint}`,
    }),
    defineField({
      name: 'projectsTitle',
      title: 'Progetti — titolo grande',
      type: 'string',
      group: 'sections',
      description: `Facoltativo. Sopra compare la scritta piccola «Progetti». Es.: "Lavori *sul campo*". ${emphasisHint}`,
    }),
    defineField({
      name: 'articlesTitle',
      title: 'Articoli — titolo grande',
      type: 'string',
      group: 'sections',
      description: `Facoltativo. Sopra compare la scritta piccola «Articoli». Es.: "Dal *quaderno* di campo". ${emphasisHint}`,
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
      name: 'publicationsTitle',
      title: 'Pubblicazioni — titolo grande',
      type: 'string',
      group: 'sections',
      description: `Facoltativo. Sopra compare la scritta piccola «Pubblicazioni». Es.: "Ricerca e *divulgazione*". ${emphasisHint}`,
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
      description: `Es.: "Hai un progetto *in mente*?". ${emphasisHint}`,
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
    defineField({
      name: 'pillarsTitle',
      title: 'Ambiti — titolo grande',
      type: 'string',
      group: 'identity',
      description: `Facoltativo. Fascia subito dopo l’apertura con i tre ambiti di lavoro. ${emphasisHint}`,
    }),
    defineField({
      name: 'pillars',
      title: 'Ambiti',
      type: 'array',
      group: 'identity',
      description: 'Tre ambiti, come nel payoff: Scienza, Natura, Sostenibilità.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pillar',
          title: 'Ambito',
          fields: [
            defineField({ name: 'title', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'text', title: 'Testo', type: 'text', rows: 3, validation: (rule) => rule.required().max(260) }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'bandImage',
      title: 'Foto a tutta larghezza',
      type: 'accessibleImage',
      group: 'identity',
      description: 'Facoltativa. Grande foto orizzontale tra le sezioni (almeno 2400 px di larghezza). Didascalia e crediti compaiono sotto.',
    }),
    defineField({
      name: 'numbers',
      title: 'Numeri in evidenza',
      type: 'array',
      group: 'identity',
      description: 'Facoltativi, massimo 4. Solo dati veri: es. "3–50" → "anni dei partecipanti, dal più piccolo al più grande".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlight',
          title: 'Numero',
          fields: [
            defineField({ name: 'value', title: 'Numero', type: 'string', validation: (rule) => rule.required().max(12) }),
            defineField({ name: 'label', title: 'Descrizione', type: 'string', validation: (rule) => rule.required().max(90) }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'manifesto',
      title: 'Manifesto',
      type: 'object',
      group: 'identity',
      description: 'Facoltativo. Una frase in grande, su fondo scuro.',
      fields: [
        defineField({ name: 'quote', title: 'Frase', type: 'text', rows: 3, validation: (rule) => rule.max(280) }),
        defineField({ name: 'attribution', title: 'Attribuzione', type: 'string', description: 'Es.: "Jane Goodall" oppure "La mia missione".' }),
      ],
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
