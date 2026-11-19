import { defineField, defineType } from 'sanity';

/** Website sections a menu item can point to. Keep in sync with web/src/i18n/config.ts. */
export const sitePages = [
  { title: 'Home', value: 'home' },
  { title: 'Chi sono', value: 'about' },
  { title: 'Servizi', value: 'services' },
  { title: 'Progetti', value: 'projects' },
  { title: 'Pubblicazioni', value: 'publications' },
  { title: 'Articoli', value: 'articles' },
  { title: 'Contatti', value: 'contact' },
] as const;

/** Menu link: either a website section (translated URL resolved automatically) or an external URL. */
export const navLink = defineType({
  name: 'navLink',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Etichetta',
      type: 'localeString',
      description: 'Il testo del link in ciascuna lingua.',
      validation: (rule) =>
        rule.custom((value: { it?: string; en?: string } | undefined) =>
          value?.it && value?.en ? true : 'Inserisci l’etichetta in entrambe le lingue.',
        ),
    }),
    defineField({
      name: 'linkType',
      title: 'Tipo di link',
      type: 'string',
      options: {
        list: [
          { title: 'Sezione del sito', value: 'internal' },
          { title: 'Pagina', value: 'page' },
          { title: 'Sito esterno', value: 'external' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'internal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'internalPage',
      title: 'Sezione',
      type: 'string',
      options: { list: [...sitePages] },
      hidden: ({ parent }) => parent?.linkType !== 'internal',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { linkType?: string })?.linkType === 'internal' && !value ? 'Scegli una sezione.' : true,
        ),
    }),
    defineField({
      name: 'page',
      title: 'Pagina',
      type: 'reference',
      to: [{ type: 'page' }],
      description: 'Ad es. Privacy policy. Il sito userà automaticamente la traduzione nella lingua giusta.',
      options: { filter: 'language == "it"' },
      hidden: ({ parent }) => parent?.linkType !== 'page',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { linkType?: string })?.linkType === 'page' && !value ? 'Scegli una pagina.' : true,
        ),
    }),
    defineField({
      name: 'url',
      title: 'Indirizzo esterno',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule
          .uri({ scheme: ['http', 'https', 'mailto', 'tel'] })
          .custom((value, context) =>
            (context.parent as { linkType?: string })?.linkType === 'external' && !value
              ? 'Inserisci l’indirizzo.'
              : true,
          ),
    }),
  ],
  preview: {
    select: { it: 'label.it', en: 'label.en', linkType: 'linkType', internalPage: 'internalPage', url: 'url' },
    prepare: ({ it, en, linkType, internalPage, url }) => ({
      title: [it, en].filter(Boolean).join(' / ') || 'Link senza etichetta',
      subtitle:
        linkType === 'external'
          ? url
          : linkType === 'page'
            ? 'Pagina'
            : sitePages.find((p) => p.value === internalPage)?.title,
    }),
  },
});
