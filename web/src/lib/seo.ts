import { shareImageUrl, type SanityImageSource } from './sanity/image';
import type { SITE_SETTINGS_QUERY_RESULT } from './sanity/sanity.types';

interface SeoFields {
  title?: string | null;
  description?: string | null;
  noIndex?: boolean | null;
  image?: SanityImageSource | null;
}

export interface PageSeo {
  title: string;
  description: string | undefined;
  image: string | undefined;
  imageAlt: string | undefined;
  noindex: boolean;
}

/**
 * Resolves page metadata with this precedence:
 * document SEO fields → document content (title, excerpt, cover) → site defaults.
 */
export function buildSeo(input: {
  title: string;
  seo?: SeoFields | null | undefined;
  description?: string | null | undefined;
  image?: SanityImageSource | null | undefined;
  settings?: SITE_SETTINGS_QUERY_RESULT | undefined;
}): PageSeo {
  const { title, seo, description, image, settings } = input;
  const ownImage = seo?.image?.asset ? seo.image : image;
  return {
    title: seo?.title || title,
    description: seo?.description || description || settings?.defaultSeoDescription || undefined,
    image: shareImageUrl(ownImage) ?? shareImageUrl(settings?.defaultShareImage),
    imageAlt: ownImage?.alt ?? undefined,
    noindex: Boolean(seo?.noIndex),
  };
}
