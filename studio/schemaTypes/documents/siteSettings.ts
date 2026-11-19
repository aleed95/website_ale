import { CogIcon } from '@sanity/icons/Cog';
import { defineField, defineType } from 'sanity';

/**
 * Global settings shared by both languages: identity, contacts, social profiles and
 * SEO defaults. The logo itself lives in the website code, as prescribed by the brand
 * manual (original files only, colour variant chosen per background).
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Impostazioni sito',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identity', title: 'Identità', default: true },
    { name: 'contact', title: 'Contatti' },
    { name: 'social', title: 'Social' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nome del sito',
      type: 'string',
      group: 'identity',
      description: 'Compare nel titolo delle schede del browser e nei risultati di Google.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Payoff',
      type: 'localeString',
      group: 'identity',
      description: 'Es.: "Scienza, natura & sostenibilità".',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefono',
      type: 'string',
      group: 'contact',
      description: 'Facoltativo. Con prefisso internazionale, es.: +39 333 1234567.',
    }),
    defineField({
      name: 'address',
      title: 'Indirizzo / zona di lavoro',
      type: 'localeText',
      group: 'contact',
      description: 'Facoltativo.',
    }),
    defineField({
      name: 'vatNumber',
      title: 'Partita IVA',
      type: 'string',
      group: 'contact',
      description: 'Facoltativa. Per i professionisti va indicata nel sito.',
    }),
    defineField({
      name: 'privacyPage',
      title: 'Pagina della privacy policy',
      type: 'reference',
      to: [{ type: 'page' }],
      group: 'contact',
      options: { filter: 'language == "it"' },
      description:
        'Collegata alla casella di consenso del modulo di contatto. Scegli la versione italiana: il sito userà da solo la traduzione inglese.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Profili social',
      type: 'array',
      group: 'social',
      of: [{ type: 'socialLink' }],
    }),
    defineField({
      name: 'defaultSeoDescription',
      title: 'Descrizione predefinita per Google',
      type: 'localeText',
      group: 'seo',
      description: 'Usata quando una pagina non ha una descrizione propria.',
    }),
    defineField({
      name: 'defaultShareImage',
      title: 'Immagine predefinita per la condivisione',
      type: 'image',
      group: 'seo',
      description: 'Usata sui social quando una pagina non ha un’immagine propria. 1200×630 px.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Impostazioni sito' }) },
});
