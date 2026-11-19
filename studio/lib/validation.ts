import type { SlugIsUniqueValidator } from 'sanity';

/**
 * Slugs must be unique per document type *and* language: the Italian and English
 * versions of a project may legitimately share the same slug.
 */
export const isUniqueSlugPerLanguage: SlugIsUniqueValidator = async (slug, context) => {
  const { document, getClient } = context;
  if (!document) return true;

  const client = getClient({ apiVersion: '2026-11-01' });
  const id = document._id.replace(/^drafts\./, '');
  const language = (document as { language?: string }).language ?? null;

  const count = await client.fetch<number>(
    `count(*[
      _type == $type &&
      slug.current == $slug &&
      !(_id in [$draft, $published]) &&
      (language == $language || ($language == null && !defined(language)))
    ])`,
    { type: document._type, slug, draft: `drafts.${id}`, published: id, language },
  );

  return count === 0;
};

/** Shared helpers for SEO-friendly lengths (warnings, not hard errors). */
export const seoLimits = {
  title: 60,
  description: 160,
  excerpt: 220,
} as const;
