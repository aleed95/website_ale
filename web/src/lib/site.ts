/**
 * Build-time fallbacks used until (or if) Sanity "Site settings" are unavailable.
 * The CMS values always take precedence once connected in phase 2.
 */
export const siteFallback = {
  /** Brand name from the brand manual. */
  name: 'Alessandro Dini',
} as const;
