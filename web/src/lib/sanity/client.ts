/**
 * Sanity clients.
 *
 * - `sanityClient`: published content, used at build time for the public static site.
 *   It never runs in the browser.
 * - `createPreviewClient()`: drafts + "stega" (invisible markers that let the Studio's
 *   Presentation tool map each text on the page back to its field — click-to-edit).
 *   Used only by the on-demand /anteprima/ pages; needs the read token, which stays on
 *   the server (Netlify environment variable).
 */
import { createClient, type SanityClient } from '@sanity/client';
import { SANITY_API_READ_TOKEN, SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from 'astro:env/server';

export const STUDIO_URL = 'https://alessandrodini.sanity.studio';

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  // Builds run right after a publish: read straight from the API, not the CDN cache.
  useCdn: false,
  perspective: 'published',
  ...(SANITY_API_READ_TOKEN ? { token: SANITY_API_READ_TOKEN } : {}),
});

/**
 * Only plain text meant to be read on the page is stega-encoded. Values used in code
 * (link types, enum keys, slugs, URLs, dates, e-mails) must stay untouched, so this is
 * an allow-list of field names.
 */
const STEGA_FIELDS = new Set([
  'title', 'summary', 'excerpt', 'intro', 'introduction', 'text', 'caption', 'credit',
  'heroEyebrow', 'heroTitle', 'heroText', 'introTitle', 'introText', 'ctaTitle', 'ctaText', 'ctaLabel',
  'name', 'bio', 'description', 'organization', 'location', 'client', 'publisher', 'citationDetails',
  'formTitle', 'thanksTitle', 'thanksText', 'footerSummary', 'tagline', 'address', 'items', 'authors',
  'tags', 'it', 'en',
]);

export function createPreviewClient(): SanityClient {
  if (!SANITY_API_READ_TOKEN) {
    throw new Error('SANITY_API_READ_TOKEN is required for the preview (Viewer token).');
  }
  return sanityClient.withConfig({
    token: SANITY_API_READ_TOKEN,
    perspective: 'drafts',
    useCdn: false,
    stega: {
      enabled: true,
      studioUrl: STUDIO_URL,
      filter: (props) => {
        const last = props.sourcePath.at(-1);
        const key = typeof last === 'number' ? props.sourcePath.at(-2) : last;
        return STEGA_FIELDS.has(String(key)) && props.filterDefault(props);
      },
    },
  });
}
