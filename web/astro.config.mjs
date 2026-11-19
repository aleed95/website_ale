// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sitemapNoindex from './integrations/sitemap-noindex.mjs';

// Public URL of the site, used for canonical URLs, Open Graph and the sitemap.
// SITE_URL wins; on Netlify the built-in URL variable is the fallback.
const site = process.env.SITE_URL ?? process.env.URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',

  // Content Security Policy as a <meta> tag: Astro adds hashes for its own scripts and
  // styles; everything else is restricted to this site and the Sanity image CDN.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' https://cdn.sanity.io data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      styleDirective: {
        resources: [
          "'self'",
          // Blurred image placeholders are set through the style attribute only.
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },

  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: { prefixDefaultLocale: false },
  },

  // Brand typefaces (see brand manual p.10). Astro downloads them at build time and
  // serves them from this site: no requests to Google from visitors' browsers.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      weights: ['400 600'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geologica',
      cssVariable: '--font-geologica',
      weights: ['300 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  // Typed environment variables. Everything is read at build time only, on the server;
  // nothing here is shipped to the browser.
  env: {
    schema: {
      SANITY_PROJECT_ID: envField.string({ context: 'server', access: 'public' }),
      SANITY_DATASET: envField.string({ context: 'server', access: 'public', default: 'production' }),
      SANITY_API_VERSION: envField.string({ context: 'server', access: 'public', default: '2026-11-01' }),
      SANITY_API_READ_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
    // Must come after sitemap(): prunes pages marked noindex in Sanity.
    sitemapNoindex(),
  ],
});
