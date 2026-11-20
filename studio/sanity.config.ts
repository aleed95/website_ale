import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from '@sanity/document-internationalization';
import { visionTool } from '@sanity/vision';
import { defineConfig, type DocumentActionComponent } from 'sanity';
import { ComposeIcon } from '@sanity/icons/Compose';
import { UploadIcon } from '@sanity/icons/Upload';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';

import { dataset, previewOrigin, projectId } from './lib/env';
import { locations, mainDocuments, PREVIEW } from './presentation/resolve';
import { languages, singletonTypes, translatedDocumentTypes } from './lib/languages';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';
import { NewArticleTool } from './tools/NewArticleTool';
import { RequestPublishTool } from './tools/RequestPublishTool';

const translatedTypes: readonly string[] = translatedDocumentTypes;
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'default',
  title: 'Alessandro Dini — Sito web',

  projectId,
  dataset,

  plugins: [
    structureTool({ structure, title: 'Contenuti' }),
    // "Anteprima": the site with drafts, side by side with the editor (click-to-edit).
    presentationTool({
      title: 'Anteprima',
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
    // GROQ playground, useful for the developer. Hidden from the client in a later phase if preferred.
    visionTool({ defaultApiVersion: '2026-11-01', title: 'Query (sviluppo)' }),
  ],

  // Extra top-bar tool: ask the developer to publish the changes on the live site.
  tools: (prev) => [
    { name: 'nuovo-articolo', title: 'Nuovo articolo', icon: ComposeIcon, component: NewArticleTool },
    ...prev,
    { name: 'aggiorna-sito', title: 'Aggiorna il sito', icon: UploadIcon, component: RequestPublishTool },
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
