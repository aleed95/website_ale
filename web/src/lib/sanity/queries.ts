/**
 * GROQ queries used by the website.
 *
 * Every query is wrapped in `defineQuery` so Sanity TypeGen can generate its result type
 * (see sanity.types.ts — run `npm run typegen` after editing this file or a schema).
 * Queries take `$language` ("it" | "en") wherever content is language-specific.
 */
import { defineQuery } from 'groq';

// ─── Reusable projections ────────────────────────────────────────────────────

/** Image with alt text, crop/hotspot and the metadata needed for responsive markup. */
const imageFields = /* groq */ `
  alt,
  caption,
  credit,
  crop,
  hotspot,
  asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
`;

/** Video: YouTube/Vimeo link or uploaded file (with its CDN URL and type). */
const videoFields = /* groq */ `
  source,
  url,
  title,
  caption,
  "file": file.asset->{ url, mimeType },
  poster { ${imageFields} }
`;

/** Rich text: dereference images and videos inside Portable Text. */
const richTextFields = /* groq */ `
  ...,
  _type == "accessibleImage" => { _type, _key, ${imageFields} },
  _type == "video" => { _type, _key, ${videoFields} }
`;

const seoFields = /* groq */ `
  seo {
    title,
    description,
    noIndex,
    image { asset->{ _id, url, metadata { dimensions { width, height } } } }
  }
`;

/** Slugs of all language versions of a translated document. */
const translationFields = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
    "language": value->language,
    "slug": value->slug.current
  }
`;

const categoryFields = /* groq */ `
  _id,
  "title": select($language == "en" => title.en, title.it),
  "slug": slug.current
`;

const navLinkFields = /* groq */ `
  _key,
  "label": select($language == "en" => label.en, label.it),
  linkType,
  internalPage,
  url,
  "pageSlug": select(
    page->language == $language => page->slug.current,
    *[_type == "translation.metadata" && references(^.page._ref)][0]
      .translations[language == $language][0].value->slug.current
  )
`;

const serviceCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  image { ${imageFields} }
`;

const projectCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  startDate,
  endDate,
  coverImage { ${imageFields} },
  "category": category->{ ${categoryFields} }
`;

const articleCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage { ${imageFields} },
  "categories": categories[]->{ ${categoryFields} },
  tags
`;

const publicationFields = /* groq */ `
  _id,
  title,
  publicationType,
  authors,
  publishedAt,
  publisher,
  citationDetails,
  doi,
  url,
  "description": select($language == "en" => description.en, description.it),
  coverImage { ${imageFields} }
`;

const sectionIntroFields = /* groq */ `{ title, intro, ${seoFields} }`;

// ─── Global ──────────────────────────────────────────────────────────────────

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    siteName,
    "tagline": select($language == "en" => tagline.en, tagline.it),
    email,
    phone,
    "address": select($language == "en" => address.en, address.it),
    vatNumber,
    "privacyPageSlug": select(
      privacyPage->language == $language => privacyPage->slug.current,
      *[_type == "translation.metadata" && references(^.privacyPage._ref)][0]
        .translations[language == $language][0].value->slug.current
    ),
    socialLinks[]{ _key, platform, label, url },
    "defaultSeoDescription": select($language == "en" => defaultSeoDescription.en, defaultSeoDescription.it),
    defaultShareImage { asset->{ _id, url, metadata { dimensions { width, height } } } }
  }
`);

export const NAVIGATION_QUERY = defineQuery(`
  *[_type == "navigation" && _id == "navigation"][0]{
    mainMenu[]{ ${navLinkFields} },
    "footerSummary": select($language == "en" => footerSummary.en, footerSummary.it),
    "copyrightNote": select($language == "en" => copyrightNote.en, copyrightNote.it),
    footerLinks[]{ ${navLinkFields} }
  }
`);

export const SECTION_PAGES_QUERY = defineQuery(`
  *[_type == "sectionPages" && _id == "sectionPages-" + $language][0]{
    services ${sectionIntroFields},
    projects ${sectionIntroFields},
    publications ${sectionIntroFields},
    articles ${sectionIntroFields},
    contact ${sectionIntroFields},
    contactForm { formTitle, thanksTitle, thanksText }
  }
`);

// ─── Home ────────────────────────────────────────────────────────────────────

export const HOME_QUERY = defineQuery(`{
  "page": *[_type == "homePage" && _id == "homePage-" + $language][0]{
    heroImage { ${imageFields} },
    heroEyebrow,
    heroTitle,
    heroText,
    introTitle,
    introText,
    pillarsTitle,
    pillars[]{ _key, title, text },
    bandImage { ${imageFields} },
    numbers[]{ _key, value, label },
    manifesto { quote, attribution },
    servicesTitle,
    projectsTitle,
    articlesTitle,
    publicationsTitle,
    "featuredProjects": featuredProjects[]->{ ${projectCardFields} },
    "featuredPublications": featuredPublications[]->{ ${publicationFields} },
    ctaTitle,
    ctaText,
    ctaLabel,
    ${seoFields}
  },
  "services": *[_type == "service" && language == $language && defined(slug.current)]
    | order(order asc, title asc){ ${serviceCardFields} },
  "latestArticles": *[_type == "article" && language == $language && defined(slug.current)]
    | order(publishedAt desc)[0...3]{ ${articleCardFields} }
}`);

// ─── About ───────────────────────────────────────────────────────────────────

export const BIOGRAPHY_QUERY = defineQuery(`
  *[_type == "biography" && _id == "biography-" + $language][0]{
    title,
    introduction,
    profileImage { ${imageFields} },
    body[]{ ${richTextFields} },
    education[]{ _key, title, organization, location, startYear, endYear, description },
    experience[]{ _key, title, organization, location, startYear, endYear, description },
    skills[]{ _key, title, items },
    qualifications[]{ _key, title, issuer, year, url },
    ${seoFields}
  }
`);

// ─── Services ────────────────────────────────────────────────────────────────

export const SERVICES_QUERY = defineQuery(`
  *[_type == "service" && language == $language && defined(slug.current)] | order(order asc, title asc){
    ${serviceCardFields},
    description[]{ ${richTextFields} },
    "relatedProjects": *[_type == "project" && language == $language && defined(slug.current) && references(^._id)]
      | order(startDate desc){ _id, title, "slug": slug.current }
  }
`);

// ─── Projects ────────────────────────────────────────────────────────────────

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && language == $language && defined(slug.current)] | order(startDate desc){
    ${projectCardFields}
  }
`);

/** Full projects of one language, used by getStaticPaths (one request for all pages). */
export const PROJECT_PAGES_QUERY = defineQuery(`
  *[_type == "project" && language == $language && defined(slug.current)]{
    ${projectCardFields},
    body[]{ ${richTextFields} },
    gallery[]{
      _key,
      _type,
      _type == "accessibleImage" => { ${imageFields} },
      _type == "video" => { ${videoFields} }
    },
    client,
    location,
    "relatedServices": relatedServices[]->{ _id, title, "slug": slug.current },
    ${seoFields},
    ${translationFields}
  }
`);

// ─── Articles ────────────────────────────────────────────────────────────────

export const ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && language == $language && defined(slug.current)] | order(publishedAt desc){
    ${articleCardFields}
  }
`);

export const ARTICLE_PAGES_QUERY = defineQuery(`
  *[_type == "article" && language == $language && defined(slug.current)]{
    ${articleCardFields},
    body[]{ ${richTextFields} },
    "author": author->{
      name,
      image { ${imageFields} },
      "bio": select($language == "en" => bio.en, bio.it)
    },
    ${seoFields},
    ${translationFields}
  }
`);

// ─── Publications ────────────────────────────────────────────────────────────

export const PUBLICATIONS_QUERY = defineQuery(`
  *[_type == "publication"] | order(publishedAt desc){ ${publicationFields} }
`);

// ─── Generic pages (privacy policy…) ─────────────────────────────────────────

export const PAGE_PAGES_QUERY = defineQuery(`
  *[_type == "page" && language == $language && defined(slug.current)]{
    _id,
    title,
    "slug": slug.current,
    body[]{ ${richTextFields} },
    ${seoFields},
    ${translationFields}
  }
`);
