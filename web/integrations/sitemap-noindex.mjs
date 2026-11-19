// @ts-check
/**
 * Removes pages marked `<meta name="robots" content="noindex…">` from the sitemap.
 * Runs after @astrojs/sitemap and reads the built HTML, so it always agrees with what
 * the editor set in Sanity ("Nascondi dai motori di ricerca").
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @returns {import('astro').AstroIntegration} */
export default function sitemapNoindex() {
  /** @type {URL | undefined} */
  let site;
  return {
    name: 'sitemap-noindex',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site ? new URL(config.site) : undefined;
      },
      'astro:build:done': async ({ dir, logger }) => {
        if (!site) return;
        const root = fileURLToPath(dir);
        const files = await readdir(root, { recursive: true });

        const noindex = new Set();
        for (const file of files.filter((f) => f.endsWith('.html'))) {
          const html = await readFile(join(root, file), 'utf8');
          if (/<meta name="robots" content="noindex/.test(html)) {
            const path = `/${relative(root, join(root, file)).split(sep).join('/')}`.replace(/index\.html$/, '');
            noindex.add(new URL(path, site).href);
          }
        }
        if (noindex.size === 0) return;

        for (const file of files.filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
          const path = join(root, file);
          const xml = await readFile(path, 'utf8');
          const cleaned = xml.replace(/<url>(?:(?!<\/url>).)*?<loc>([^<]+)<\/loc>.*?<\/url>/gs, (entry, loc) =>
            noindex.has(loc) ? '' : entry,
          );
          await writeFile(path, cleaned);
        }
        logger.info(`Removed ${noindex.size} noindex page(s) from the sitemap.`);
      },
    },
  };
}
