import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from '@sanity/document-internationalization';
import { visionTool } from '@sanity/vision';
import { defineConfig, type DocumentActionComponent } from 'sanity';
import { structureTool } from 'sanity/structure';

import { dataset, projectId } from './lib/env';
import { languages, singletonTypes, translatedDocumentTypes } from './lib/languages';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

const translatedTypes: readonly string[] = translatedDocumentTypes;
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'default',
  title: 'Alessandro Dini — Sito web',

  projectId,
  dataset,

  plugins: [
    structureTool({ structure, title: 'Contenuti' }),
    documentInternationalization({
      supportedLanguages: [...languages],
      schemaTypes: [...translatedDocumentTypes],
      languageField: 'language',
    }),
    // GROQ playground, useful for the developer. Hidden from the client in a later phase if preferred.
    visionTool({ defaultApiVersion: '2026-11-01', title: 'Query (sviluppo)' }),
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
