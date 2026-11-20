import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from '@sanity/document-internationalization';
import { visionTool } from '@sanity/vision';
import { defineConfig, type DocumentActionComponent } from 'sanity';
import { ComposeIcon } from '@sanity/icons/Compose';
import { ImagesIcon } from '@sanity/icons/Images';
import { UploadIcon } from '@sanity/icons/Upload';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';

import { dataset, previewOrigin, projectId } from './lib/env';
import { locations, mainDocuments, PREVIEW } from './presentation/resolve';
import { languages, singletonTypes, translatedDocumentTypes } from './lib/languages';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';
import { newDocumentTool } from './tools/NewDocumentTool';
import { RequestPublishTool } from './tools/RequestPublishTool';

const translatedTypes: readonly string[] = translatedDocumentTypes;
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'default',
  title: 'Alessandro Dini — Sito web',

  projectId,
  dataset,

  plugins: [
    structureTool({ structure, title: 'Tutti i contenuti' }),
    // "Modifica sul sito": the site with drafts, side by side with the editor (click-to-edit).
    presentationTool({
      title: 'Modifica sul sito',
      previewUrl: {
        origin: previewOrigin,
        preview: `${PREVIEW}/`,
        previewMode: { enable: '/api/anteprima/attiva/', disable: '/api/anteprima/disattiva/' },
      },
      allowOrigins: [previewOrigin],
      resolve: { mainDocuments, locations },
    }),
    documentInternationalization({
      supportedLanguages: [...languages],
      schemaTypes: [...translatedDocumentTypes],
      languageField: 'language',
    }),
    // GROQ playground for the developer: only in the local Studio (`npm run dev:studio`).
    ...(import.meta.env.DEV ? [visionTool({ defaultApiVersion: '2026-11-01', title: 'Query (sviluppo)' })] : []),
  ],

  // Content Releases (scheduling groups of changes) is not needed here and would only
  // confuse the editor.
  releases: { enabled: false },

  // Extra top-bar tool: ask the developer to publish the changes on the live site.
  // Top bar order: Tutti i contenuti, Nuovo articolo, Nuovo progetto, Modifica sul sito,
  // Richiedi aggiornamento (+ Query only in the local Studio).
  tools: (prev) => [
    ...prev.filter((tool) => tool.name === 'structure'),
    { name: 'nuovo-articolo', title: 'Nuovo articolo', icon: ComposeIcon, component: newDocumentTool('article', 'article-it') },
    { name: 'nuovo-progetto', title: 'Nuovo progetto', icon: ImagesIcon, component: newDocumentTool('project', 'project-it') },
    ...prev.filter((tool) => tool.name !== 'structure'),
    { name: 'aggiorna-sito', title: 'Richiedi aggiornamento', icon: UploadIcon, component: RequestPublishTool },
  ],

  schema: {
    types: schemaTypes,
    // Hide the generic templates of singletons and of translated types: translated
    // documents must always be created with a language (templates `<type>-it`/`<type>-en`).
    templates: (templates) =>
      templates.filter(
        (template) => !singletonTypes.includes(template.schemaType) && !translatedTypes.includes(template.id),
      ),
  },

  document: {
    // Keep the global "Create" menu simple: no singletons, no technical templates.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !singletonTypes.includes(item.templateId) && !item.templateId.endsWith('-parameterized'))
        : prev,

    actions: (prev, { schemaType }) => {
      // Singletons can't be duplicated, deleted or unpublished by mistake.
      if (singletonTypes.includes(schemaType)) {
        return prev.filter(({ action }) => action !== undefined && singletonActions.has(action));
      }
      if (translatedTypes.includes(schemaType)) {
        // The plugin types `action` as a plain string; the components are valid actions.
        return [
          ...prev,
          useDeleteTranslationAction as DocumentActionComponent,
          useDuplicateWithTranslationsAction as DocumentActionComponent,
        ];
      }
      return prev;
    },
  },
});
