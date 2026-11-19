import { defineField, defineType } from 'sanity';

const yearRule = (rule: import('sanity').NumberRule) => rule.integer().min(1950).max(2100);

/** One entry of an education or work timeline (newest first on the website). */
export const timelineEntry = defineType({
  name: 'timelineEntry',
  title: 'Voce',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      description: 'Es.: "Laurea magistrale in Scienze naturali" oppure "Consulente ambientale".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'organization',
      title: 'Ente / Università / Azienda',
      type: 'string',
    }),
    defineField({ name: 'location', title: 'Luogo', type: 'string' }),
    defineField({
      name: 'startYear',
      title: 'Anno di inizio',
      type: 'number',
      validation: (rule) => yearRule(rule),
    }),
    defineField({
      name: 'endYear',
      title: 'Anno di fine',
      type: 'number',
      description: 'Lascia vuoto se è in corso.',
      validation: (rule) => yearRule(rule),
    }),
    defineField({ name: 'description', title: 'Descrizione', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'title', organization: 'organization', startYear: 'startYear', endYear: 'endYear' },
    prepare: ({ title, organization, startYear, endYear }) => ({
      title,
      subtitle: [organization, startYear ? `${startYear}–${endYear ?? 'oggi'}` : undefined]
        .filter(Boolean)
        .join(' · '),
    }),
  },
});

/** A group of skills, e.g. "Fauna" → ["Avifauna", "Erpetofauna"]. */
export const skillGroup = defineType({
  name: 'skillGroup',
  title: 'Gruppo di competenze',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Titolo del gruppo', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'items',
      title: 'Competenze',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Scrivi una competenza e premi Invio.',
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare: ({ title, items }) => ({ title, subtitle: Array.isArray(items) ? items.join(', ') : undefined }),
  },
});

/** Certification, licence, membership or award. */
export const qualification = defineType({
  name: 'qualification',
  title: 'Titolo o qualifica',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'issuer', title: 'Rilasciato da', type: 'string' }),
    defineField({ name: 'year', title: 'Anno', type: 'number', validation: (rule) => yearRule(rule) }),
    defineField({ name: 'url', title: 'Link (facoltativo)', type: 'url' }),
  ],
  preview: {
    select: { title: 'title', issuer: 'issuer', year: 'year' },
    prepare: ({ title, issuer, year }) => ({ title, subtitle: [issuer, year].filter(Boolean).join(' · ') }),
  },
});
