import type { SchemaTypeDefinition } from 'sanity';

import { accessibleImage } from './objects/accessibleImage';
import { blockContent } from './objects/blockContent';
import { qualification, skillGroup, timelineEntry } from './objects/biographyItems';
import { localeString, localeText } from './objects/localeString';
import { navLink } from './objects/navLink';
import { sectionIntro } from './objects/sectionIntro';
import { seo } from './objects/seo';
import { socialLink } from './objects/socialLink';

import { article } from './documents/article';
import { author } from './documents/author';
import { biography } from './documents/biography';
import { category } from './documents/category';
import { homePage } from './documents/homePage';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { project } from './documents/project';
import { publication } from './documents/publication';
import { sectionPages } from './documents/sectionPages';
import { service } from './documents/service';
import { siteSettings } from './documents/siteSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  siteSettings,
  navigation,
  homePage,
  biography,
  sectionPages,
  service,
  project,
  article,
  publication,
  category,
  author,
  page,
  // Objects
  localeString,
  localeText,
  accessibleImage,
  blockContent,
  seo,
  sectionIntro,
  navLink,
  socialLink,
  timelineEntry,
  skillGroup,
  qualification,
];
