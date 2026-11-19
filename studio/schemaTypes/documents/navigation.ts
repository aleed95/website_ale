import { MenuIcon } from '@sanity/icons/Menu';
import { defineField, defineType } from 'sanity';

/** Header menu and footer content, shared by both languages (labels are translated per field). */
export const navigation = defineType({
  name: 'navigation',
  title: 'Navigazione e footer',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'mainMenu',
      title: 'Menu principale',
      type: 'array',
      of: [{ type: 'navLink' }],
      description: 'Le voci del menu in alto, nell’ordine in cui appaiono. Trascinale per riordinarle.',
      validation: (rule) => rule.max(8).warning('Più di 8 voci rendono il menu difficile da usare.'),
    }),
    defineField({
      name: 'footerSummary',
      title: 'Presentazione nel footer',
      type: 'localeText',
      description: 'Una o due frasi su chi sei, mostrate in fondo a ogni pagina.',
    }),
    defineField({
      name: 'footerLinks',
      title: 'Link nel footer',
      type: 'array',
      of: [{ type: 'navLink' }],
      description: 'Ad es. Privacy policy, Cookie policy.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Navigazione e footer' }) },
});
