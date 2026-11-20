/**
 * Studio environment. Values are public (bundled into the Studio): never put tokens here.
 * See studio/.env.example.
 */
function read(name: string): string | undefined {
  // Sanity loads .env files and exposes SANITY_STUDIO_* on import.meta.env (Studio)
  // and on process.env (CLI). Read both so config works in either context.
  const fromImportMeta = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name];
  const fromProcess = typeof process === 'undefined' ? undefined : process.env[name];
  return fromImportMeta || fromProcess || undefined;
}

// Placeholder project ID keeps the Studio and `sanity schema validate` runnable before
// the real project is configured; the Studio will show a clear error if it is used.
export const projectId = read('SANITY_STUDIO_PROJECT_ID') ?? 'missing-project-id';
export const dataset = read('SANITY_STUDIO_DATASET') ?? 'production';
export const studioHost = read('SANITY_STUDIO_HOSTNAME');

/** Website that renders the live preview (Netlify, or http://localhost:4321 in development). */
export const previewOrigin = read('SANITY_STUDIO_PREVIEW_ORIGIN') ?? 'https://alessandrodini.netlify.app';
