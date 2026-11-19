import { defineCliConfig } from 'sanity/cli';

// The CLI loads studio/.env before evaluating this file.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'missing-project-id';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const studioHost = process.env.SANITY_STUDIO_HOSTNAME || undefined;

export default defineCliConfig({
  api: { projectId, dataset },
  ...(studioHost ? { studioHost } : {}),
  // TypeGen: reads the GROQ queries of the website and writes their result types.
  // Run `npm run typegen` after changing a schema or a query.
  typegen: {
    path: '../web/src/lib/sanity/**/*.ts',
    schema: './schema.json',
    generates: '../web/src/lib/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
  // Auto-updates off: the deployed Studio runs exactly the versions pinned in
  // package-lock.json, which are the ones tested with the plugins in use.
  deployment: {
    // Hosted Studio: https://alessandrodini.sanity.studio (not secret).
    appId: 'relwp50mzlkrys3m49pxdwhp',
    autoUpdates: false,
  },
});
