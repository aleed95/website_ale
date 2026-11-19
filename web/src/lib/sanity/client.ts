/**
 * Sanity client used at build time only (static site). It never runs in the browser,
 * so the optional read token stays on the build machine.
 */
import { createClient } from '@sanity/client';
import { SANITY_API_READ_TOKEN, SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from 'astro:env/server';

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  // Builds run right after a publish: read straight from the API, not the CDN cache,
  // so the new content is always included.
  useCdn: false,
  perspective: 'published',
  ...(SANITY_API_READ_TOKEN ? { token: SANITY_API_READ_TOKEN } : {}),
});
