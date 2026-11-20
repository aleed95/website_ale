import type { Locale } from '@/i18n/config';
import { t } from '@/i18n/ui';
import type { SanityContext } from './sanity/fetch';
import { buildSeo, type PageSeo } from './seo';

export type SectionKey = 'services' | 'projects' | 'publications' | 'articles' | 'contact';

/** Heading, intro and SEO of a listing page, from "Testi delle sezioni" with UI fallbacks. */
export async function getSectionMeta(
  sanity: SanityContext,
  section: SectionKey,
  locale: Locale,
): Promise<{ title: string; intro: string | null; seo: PageSeo }> {
  const [sections, settings] = await Promise.all([sanity.getSectionPages(locale), sanity.getSiteSettings(locale)]);
  const data = sections?.[section];
  const title = data?.title || t(locale).nav[section];
  return {
    title,
    intro: data?.intro ?? null,
    seo: buildSeo({ title, seo: data?.seo, description: data?.intro, settings }),
  };
}
