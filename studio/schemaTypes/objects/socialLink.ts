import { defineField, defineType } from 'sanity';

export const socialPlatforms = [
  { title: 'Instagram', value: 'instagram' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'iNaturalist', value: 'inaturalist' },
  { title: 'ResearchGate', value: 'researchgate' },
  { title: 'ORCID', value: 'orcid' },
  { title: 'Altro', value: 'other' },
] as const;

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Profilo social',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Piattaforma',
      type: 'string',
      options: { list: [...socialPlatforms] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Nome visualizzato',
      type: 'string',
      description: 'Solo se hai scelto "Altro".',
      hidden: ({ parent }) => parent?.platform !== 'other',
    }),
    defineField({
      name: 'url',
      title: 'Indirizzo del profilo',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['https', 'http'] }),
    }),
  ],
  preview: {
    select: { platform: 'platform', label: 'label', url: 'url' },
    prepare: ({ platform, label, url }) => ({
      title: label || socialPlatforms.find((p) => p.value === platform)?.title || 'Profilo',
      subtitle: url,
    }),
  },
});
