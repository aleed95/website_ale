/** Display names of social platforms (keep in sync with studio/schemaTypes/objects/socialLink.ts). */
const platformNames: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  inaturalist: 'iNaturalist',
  researchgate: 'ResearchGate',
  orcid: 'ORCID',
};

export function socialLabel(link: { platform: string; label?: string | null }): string {
  return link.label || platformNames[link.platform] || link.platform;
}
