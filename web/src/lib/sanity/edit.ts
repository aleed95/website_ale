/**
 * Click-to-edit for values that cannot carry stega markers (images): a `data-sanity`
 * attribute pointing to the field. Only emitted on /anteprima/ pages.
 */
import { createDataAttribute } from '@sanity/visual-editing-standalone';
import { STUDIO_URL } from './client';

export interface EditTarget {
  id: string | null | undefined;
  type: string;
  path: string;
}

export function editAttribute(preview: boolean, target: EditTarget | undefined): string | undefined {
  if (!preview || !target?.id) return undefined;
  return createDataAttribute({
    baseUrl: STUDIO_URL,
    id: target.id.replace(/^drafts\./, ''),
    type: target.type,
    path: target.path,
  }).toString();
}
