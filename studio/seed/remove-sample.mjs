/**
 * Removes the sample content created by seed/build-sample.mjs from a dataset — run it
 * before launch on `production`.
 *
 *   npm run seed:clean --workspace studio -- --dataset production            # dry run
 *   npm run seed:clean --workspace studio -- --dataset production --apply    # delete
 *
 * Safe by design:
 * - only documents with a sample ID *and* a title still marked "[esempio]" / "[sample]"
 *   are deleted: anything the editor has rewritten is kept;
 * - single pages (Home, Chi sono, Testi delle sezioni, Navigazione) are never deleted,
 *   only reported if they still contain sample text, because the editor fills them in;
 * - Site settings are never touched;
 * - images are deleted only if they are sample uploads and nothing references them.
 */
import { getCliClient } from 'sanity/cli';

const args = process.argv.slice(2);
const dataset = args[args.indexOf('--dataset') + 1];
const apply = args.includes('--apply');
if (!args.includes('--dataset') || !dataset || dataset.startsWith('--')) {
  console.error('Specify the dataset: --dataset production');
  process.exit(1);
}

const client = getCliClient({ apiVersion: '2026-11-01' }).withConfig({ dataset, perspective: 'raw' });

const translated = {
  service: ['monitoring', 'education'],
  project: ['wetland', 'dunes'],
  article: ['birds', 'trees'],
  page: ['privacy'],
};
const sampleIds = [
  ...Object.entries(translated).flatMap(([type, keys]) => keys.flatMap((k) => [`${type}-${k}-it`, `${type}-${k}-en`])),
  'publication-paper',
  'publication-book',
  'publication-popular',
];
const singletonIds = [
  'navigation',
  'homePage-it',
  'homePage-en',
  'biography-it',
  'biography-en',
  'sectionPages-it',
  'sectionPages-en',
];
const sampleImages = [
  'hero', 'portrait', 'project-wetland', 'project-dunes', 'article-birds',
  'article-trees', 'service-monitoring', 'gallery-1', 'gallery-2', 'gallery-3',
].map((name) => `${name}.jpg`);
const marker = /\[(esempio|sample)\b|testo di esempio|sample text/i;

const docs = await client.fetch(`*[_id in $ids || _id in $drafts]{ _id, _type, title, name }`, {
  ids: sampleIds,
  drafts: sampleIds.map((id) => `drafts.${id}`),
});
const toDelete = docs.filter((d) => marker.test(typeof d.title === 'string' ? d.title : (d.name ?? '')));
const kept = docs.filter((d) => !toDelete.includes(d));

// Translation links of the deleted documents.
const deletedBaseIds = new Set(toDelete.map((d) => d._id.replace(/^drafts\./, '').replace(/-(it|en)$/, '')));
const metadata = await client.fetch(`*[_type == "translation.metadata" && _id in $ids]._id`, {
  ids: [...deletedBaseIds].map((base) => `tm-${base}`),
});

const singletons = await client.fetch(`*[_id in $ids]`, { ids: singletonIds });
const stillSample = singletons.filter((d) => marker.test(JSON.stringify(d))).map((d) => d._id);

console.log(`Dataset: ${dataset}${apply ? '' : '  (dry run — add --apply to delete)'}\n`);
console.log(`Sample documents to delete (${toDelete.length}):`);
for (const d of toDelete) console.log(`  - ${d._id}  ${typeof d.title === 'string' ? d.title : d.name ?? ''}`);
console.log(`Translation links to delete (${metadata.length}): ${metadata.join(', ') || '—'}`);
if (kept.length) console.log(`Kept, already rewritten by the editor: ${kept.map((d) => d._id).join(', ')}`);
if (stillSample.length) {
  console.log(`\nStill containing sample text — rewrite them in the Studio: ${stillSample.join(', ')}`);
}

if (apply && (toDelete.length || metadata.length)) {
  const tx = client.transaction();
  for (const id of metadata) tx.delete(id);
  for (const d of toDelete) tx.delete(d._id);
  await tx.commit();
  console.log('\nDeleted.');
}

// Orphaned sample images (after the deletions above).
const orphans = await client.fetch(
  `*[_type == "sanity.imageAsset" && originalFilename in $names && count(*[references(^._id)]) == 0]{ _id, originalFilename }`,
  { names: sampleImages },
);
console.log(`\nUnused sample images${apply ? ' deleted' : ' to delete'} (${orphans.length}): ${orphans.map((a) => a.originalFilename).join(', ') || '—'}`);
if (apply && orphans.length) {
  const tx = client.transaction();
  for (const asset of orphans) tx.delete(asset._id);
  await tx.commit();
}
