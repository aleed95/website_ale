import { defineField, defineType } from 'sanity';
import { seoLimits } from '../../lib/validation';

/** Per-document SEO overrides. Empty fields fall back to title/excerpt and site defaults. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO e condivisione',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo per Google',
      type: 'string',
      description: `Facoltativo. Se vuoto si usa il titolo della pagina. Ideale: max ${seoLimits.title} caratteri.`,
      validation: (rule) => rule.max(seoLimits.title).warning('Titolo lungo: Google potrebbe tagliarlo.'),
    }),
    defineField({
      name: 'description',
      title: 'Descrizione per Google',
      type: 'text',
      rows: 3,
      description: `Facoltativa. Il riassunto mostrato nei risultati di ricerca. Ideale: max ${seoLimits.description} caratteri.`,
      validation: (rule) =>
        rule.max(seoLimits.description).warning('Descrizione lunga: Google potrebbe tagliarla.'),
    }),
    defineField({
      name: 'image',
      title: 'Immagine per la condivisione',
      type: 'image',
      description: 'Facoltativa. Mostrata quando il link viene condiviso sui social. Formato consigliato 1200×630 px.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Nascondi dai motori di ricerca',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
