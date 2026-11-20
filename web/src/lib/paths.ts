/**
 * getStaticPaths helpers: one request per type and language returns every document
 * with its full content, passed to the page as props (no extra request per page).
 */
import type { Locale } from '@/i18n/config';
import { sanityClient } from './sanity/fetch';
import { PAGE_PAGES_QUERY, PROJECT_PAGES_QUERY } from './sanity/queries';
import type {
  ARTICLE_PAGES_QUERY_RESULT,
  PAGE_PAGES_QUERY_RESULT,
  PROJECT_PAGES_QUERY_RESULT,
} from './sanity/sanity.types';

export type ProjectDocument = PROJECT_PAGES_QUERY_RESULT[number];
export type ArticleDocument = ARTICLE_PAGES_QUERY_RESULT[number];
export type PageDocument = PAGE_PAGES_QUERY_RESULT[number];

function withSlug<T extends { slug: string | null }>(items: T[]): Array<T & { slug: string }> {
  return items.filter((item): item is T & { slug: string } => Boolean(item.slug));
}

export async function getProjectPaths(locale: Locale) {
  const projects = withSlug(await sanityClient.fetch(PROJECT_PAGES_QUERY, { language: locale }));
  return projects.map((project) => ({ params: { slug: project.slug }, props: { project } }));
}


export async function getPagePaths(locale: Locale) {
  const pages = withSlug(await sanityClient.fetch(PAGE_PAGES_QUERY, { language: locale }));
  return pages.map((page) => ({ params: { slug: page.slug }, props: { page } }));
}
