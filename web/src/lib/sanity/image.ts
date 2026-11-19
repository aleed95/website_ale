/**
 * Image URLs from the Sanity image CDN. `auto('format')` lets the CDN serve AVIF or WebP
 * to browsers that support them; crop and hotspot chosen in the Studio are respected.
 */
import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from './client';

const builder = createImageUrlBuilder(sanityClient);

/** Minimal shape shared by every image projection in queries.ts. */
export interface SanityImageSource {
  asset?: {
    _id: string;
    url?: string | null;
    metadata?: {
      lqip?: string | null;
      dimensions?: { width?: number | null; height?: number | null } | null;
    } | null;
  } | null;
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null;
  hotspot?: { x?: number; y?: number; height?: number; width?: number } | null;
  alt?: string | null;
  caption?: string | null;
  credit?: string | null;
}

export function hasImage<T extends SanityImageSource>(image: T | null | undefined): image is T & { asset: { _id: string } } {
  return Boolean(image?.asset?._id);
}

export function urlFor(image: SanityImageSource & { asset: { _id: string } }) {
  return builder.image({
    asset: { _ref: image.asset._id },
    ...(image.crop ? { crop: image.crop } : {}),
    ...(image.hotspot ? { hotspot: image.hotspot } : {}),
  } as Parameters<typeof builder.image>[0]);
}

/** 1200×630 JPEG for Open Graph / social previews (most scrapers ignore AVIF/WebP). */
export function shareImageUrl(image: SanityImageSource | null | undefined): string | undefined {
  if (!hasImage(image)) return undefined;
  return urlFor(image).width(1200).height(630).fit('crop').format('jpg').quality(80).url();
}
