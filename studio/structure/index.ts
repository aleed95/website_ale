import { BookIcon } from '@sanity/icons/Book';
import { CaseIcon } from '@sanity/icons/Case';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentIcon } from '@sanity/icons/Document';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { HomeIcon } from '@sanity/icons/Home';
import { ImagesIcon } from '@sanity/icons/Images';
import { MenuIcon } from '@sanity/icons/Menu';
import { TagIcon } from '@sanity/icons/Tag';
import { ThListIcon } from '@sanity/icons/ThList';
import { UserIcon } from '@sanity/icons/User';
import { UsersIcon } from '@sanity/icons/Users';
import type { ComponentType } from 'react';
import type { StructureBuilder, StructureResolver } from 'sanity/structure';
import { languages, perLanguageSingletonId, type perLanguageSingletonTypes } from '../lib/languages';

type Icon = ComponentType;

/** A document that exists exactly once (fixed ID). */
function singleton(S: StructureBuilder, type: string, title: string, icon: Icon) {
  return S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title));
}

/** A document that exists once per language: Home → Italiano / English. */
function perLanguageSingleton(
  S: StructureBuilder,
  type: (typeof perLanguageSingletonTypes)[number],
  title: string,
  icon: Icon,
) {
  return S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          languages.map((lang) =>
            S.listItem()
              .title(lang.title)
              .id(`${type}-${lang.id}`)
              .icon(icon)
              .child(
                S.document()
                  .schemaType(type)
                  .documentId(perLanguageSingletonId(type, lang.id))
                  .title(`${title} — ${lang.title}`),
              ),
          ),
        ),
    );
}

/** A translated document type, split by language: Progetti → Italiano / English. */
function translatedList(S: StructureBuilder, type: string, title: string, icon: Icon, defaultOrdering?: { field: string; direction: 'asc' | 'desc' }) {
  return S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          languages.map((lang) => {
            let list = S.documentTypeList(type)
              .title(`${title} — ${lang.title}`)
              .filter('_type == $type && language == $language')
              .params({ type, language: lang.id })
              // Template registered by @sanity/document-internationalization: sets `language`.
              .initialValueTemplates([S.initialValueTemplateItem(`${type}-${lang.id}`)]);
            if (defaultOrdering) list = list.defaultOrdering([defaultOrdering]);
            return S.listItem().title(lang.title).id(`${type}-${lang.id}`).icon(icon).child(list);
          }),
        ),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Tutti i contenuti')
    .items([
      singleton(S, 'siteSettings', 'Impostazioni sito', CogIcon),
      singleton(S, 'navigation', 'Navigazione e footer', MenuIcon),
      S.divider(),
      perLanguageSingleton(S, 'homePage', 'Home', HomeIcon),
      perLanguageSingleton(S, 'biography', 'Chi sono', UserIcon),
      perLanguageSingleton(S, 'sectionPages', 'Testi delle sezioni', ThListIcon),
      S.divider(),
      translatedList(S, 'service', 'Servizi', CaseIcon, { field: 'order', direction: 'asc' }),
      translatedList(S, 'project', 'Progetti', ImagesIcon, { field: 'startDate', direction: 'desc' }),
      translatedList(S, 'article', 'Articoli', DocumentTextIcon, { field: 'publishedAt', direction: 'desc' }),
      S.documentTypeListItem('publication').title('Pubblicazioni').icon(BookIcon),
      S.divider(),
      S.documentTypeListItem('category').title('Categorie').icon(TagIcon),
      S.documentTypeListItem('author').title('Autori').icon(UsersIcon),
      translatedList(S, 'page', 'Pagine (privacy, ecc.)', DocumentIcon),
    ]);
