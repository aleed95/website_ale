/**
 * Writes seed/sample.ndjson: clearly fake sample content for the `development` dataset,
 * used to develop and test the website. NEVER import it into `production`.
 *
 *   npm run seed --workspace studio      # builds the file and imports it into `development`
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docs = [];
const add = (doc) => docs.push(doc);

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36).padStart(4, '0')}`;

// SEED_IMAGES_DIR: use other images with the same file names (e.g. real photos for a demo).
const imagesDir = process.env.SEED_IMAGES_DIR ?? join(here, 'images');

const image = (name, alt, extra = {}) => ({
  _type: 'accessibleImage',
  _sanityAsset: `image@${pathToFileURL(join(imagesDir, `${name}.jpg`)).href}`,
  alt,
  ...extra,
});

const block = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
});

const bullets = (items) =>
  items.map((text) => ({ ...block(text), listItem: 'bullet', level: 1 }));

const ref = (id, weak = false) => ({ _type: 'reference', _ref: id, ...(weak ? { _weak: true } : {}) });

const lorem = {
  it: 'Testo di esempio. Questo contenuto serve solo a verificare impaginazione, immagini e traduzioni durante lo sviluppo e verrà sostituito dai testi reali.',
  en: 'Sample text. This content only exists to check layout, images and translations during development and will be replaced by the real copy.',
};

/** Links translated documents the way @sanity/document-internationalization does. */
const linkTranslations = (id, schemaType, ids) =>
  add({
    _id: `tm-${id}`,
    _type: 'translation.metadata',
    schemaTypes: [schemaType],
    translations: Object.entries(ids).map(([language, docId]) => ({
      _key: key(),
      _type: 'internationalizedArrayReferenceValue',
      language,
      value: ref(docId, true),
    })),
  });

// ─── Global ──────────────────────────────────────────────────────────────────

add({
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'Alessandro Dini',
  tagline: { it: 'Scienza, natura & sostenibilità', en: 'Science, nature & sustainability' },
  email: 'esempio@example.com',
  phone: '+39 000 000 0000',
  address: { it: '[Esempio] Toscana, Italia', en: '[Sample] Tuscany, Italy' },
  socialLinks: [
    { _key: key(), _type: 'socialLink', platform: 'instagram', url: 'https://example.com/instagram' },
    { _key: key(), _type: 'socialLink', platform: 'linkedin', url: 'https://example.com/linkedin' },
  ],
  defaultSeoDescription: { it: '[Esempio] Descrizione predefinita del sito.', en: '[Sample] Default site description.' },
  privacyPage: ref('page-privacy-it'),
});

add({
  _id: 'navigation',
  _type: 'navigation',
  mainMenu: [
    ['about', 'Chi sono', 'About'],
    ['services', 'Servizi', 'Services'],
    ['projects', 'Progetti', 'Projects'],
    ['publications', 'Pubblicazioni', 'Publications'],
    ['articles', 'Articoli', 'Articles'],
    ['contact', 'Contatti', 'Contact'],
  ].map(([internalPage, it, en]) => ({
    _key: key(),
    _type: 'navLink',
    linkType: 'internal',
    internalPage,
    label: { _type: 'localeString', it, en },
  })),
  footerSummary: {
    it: '[Esempio] Naturalista e consulente ambientale.',
    en: '[Sample] Naturalist and environmental consultant.',
  },
  footerLinks: [
    {
      _key: key(),
      _type: 'navLink',
      linkType: 'page',
      page: ref('page-privacy-it'),
      label: { _type: 'localeString', it: 'Privacy policy', en: 'Privacy policy' },
    },
  ],
});

for (const [lang, L] of [
  ['it', { services: 'Servizi', projects: 'Progetti', publications: 'Pubblicazioni', articles: 'Articoli', contact: 'Contatti' }],
  ['en', { services: 'Services', projects: 'Projects', publications: 'Publications', articles: 'Articles', contact: 'Contact' }],
]) {
  add({
    _id: `sectionPages-${lang}`,
    _type: 'sectionPages',
    ...Object.fromEntries(
      Object.entries(L).map(([k, title]) => [k, { _type: 'sectionIntro', title, intro: lorem[lang].slice(0, 90) }]),
    ),
    contactForm: {
      formTitle: lang === 'it' ? 'Scrivimi [esempio]' : 'Write to me [sample]',
      thanksTitle: lang === 'it' ? 'Grazie, *messaggio ricevuto* [esempio]' : 'Thank you, *message received* [sample]',
      thanksText: lorem[lang],
    },
  });
}

// ─── Taxonomies ──────────────────────────────────────────────────────────────

add({ _id: 'category-fauna', _type: 'category', title: { it: 'Fauna', en: 'Wildlife' }, slug: { _type: 'slug', current: 'fauna' } });
add({ _id: 'category-habitat', _type: 'category', title: { it: 'Habitat', en: 'Habitats' }, slug: { _type: 'slug', current: 'habitat' } });
add({ _id: 'author-main', _type: 'author', name: 'Alessandro Dini', bio: { it: lorem.it, en: lorem.en } });

// ─── Services ────────────────────────────────────────────────────────────────

const services = [
  { id: 'monitoring', order: 10, it: 'Monitoraggi faunistici [esempio]', en: 'Wildlife surveys [sample]', image: 'service-monitoring' },
  { id: 'education', order: 20, it: 'Educazione ambientale [esempio]', en: 'Environmental education [sample]' },
];
for (const s of services) {
  for (const lang of ['it', 'en']) {
    add({
      _id: `service-${s.id}-${lang}`,
      _type: 'service',
      language: lang,
      title: s[lang],
      slug: { _type: 'slug', current: `${s.id}${lang === 'en' ? '-en' : ''}` },
      summary: lorem[lang],
      description: [block(lorem[lang]), ...bullets([`${lang === 'it' ? 'Punto' : 'Point'} 1`, `${lang === 'it' ? 'Punto' : 'Point'} 2`])],
      order: s.order,
      ...(s.image ? { image: image(s.image, lang === 'it' ? 'Immagine di esempio' : 'Sample image') } : {}),
    });
  }
  linkTranslations(`service-${s.id}`, 'service', { it: `service-${s.id}-it`, en: `service-${s.id}-en` });
}

// ─── Projects ────────────────────────────────────────────────────────────────

const projects = [
  { id: 'wetland', it: 'Monitoraggio di una *zona umida* [esempio]', en: 'Wetland monitoring [sample]', start: '2024-03-01', end: null, cover: 'project-wetland', cat: 'category-habitat', service: 'monitoring', gallery: true },
  { id: 'dunes', it: 'Laboratorio sulle dune [esempio]', en: 'Dune workshop [sample]', start: '2023-05-01', end: '2023-09-30', cover: 'project-dunes', cat: 'category-fauna', service: 'education' },
];
for (const p of projects) {
  for (const lang of ['it', 'en']) {
    const alt = lang === 'it' ? 'Immagine di esempio' : 'Sample image';
    add({
      _id: `project-${p.id}-${lang}`,
      _type: 'project',
      language: lang,
      title: p[lang],
      slug: { _type: 'slug', current: p.id === 'wetland' && lang === 'it' ? 'zona-umida' : p.id },
      summary: lorem[lang],
      body: [block(lang === 'it' ? 'Obiettivi' : 'Goals', 'h2'), block(lorem[lang]), block(lorem[lang], 'blockquote')],
      coverImage: image(p.cover, alt, { caption: lang === 'it' ? 'Didascalia di esempio' : 'Sample caption', credit: 'Foto di esempio' }),
      ...(p.gallery
        ? { gallery: ['gallery-1', 'gallery-2', 'gallery-3'].map((g) => ({ _key: key(), ...image(g, alt) })) }
        : {}),
      category: ref(p.cat),
      startDate: p.start,
      ...(p.end ? { endDate: p.end } : {}),
      client: '[Esempio] Ente Parco',
      location: '[Esempio] Toscana',
      relatedServices: [{ _key: key(), ...ref(`service-${p.service}-${lang}`) }],
      featured: true,
    });
  }
  linkTranslations(`project-${p.id}`, 'project', { it: `project-${p.id}-it`, en: `project-${p.id}-en` });
}

// ─── Articles (the second one is Italian only, to test missing translations) ─

add({
  _id: 'article-birds-it',
  _type: 'article',
  language: 'it',
  title: 'Osservare gli uccelli in inverno [esempio]',
  slug: { _type: 'slug', current: 'uccelli-in-inverno' },
  excerpt: lorem.it,
  body: [block(lorem.it), block('Cosa portare', 'h2'), ...bullets(['Binocolo', 'Quaderno da campo']), { _key: key(), ...image('gallery-2', 'Immagine di esempio', { caption: 'Immagine nel testo' }) }, block(lorem.it)],
  coverImage: image('article-birds', 'Immagine di esempio'),
  publishedAt: '2026-10-12',
  author: ref('author-main'),
  categories: [{ _key: key(), ...ref('category-fauna') }],
  tags: ['birdwatching', 'inverno'],
});
add({
  _id: 'article-birds-en',
  _type: 'article',
  language: 'en',
  title: 'Watching birds in winter [sample]',
  slug: { _type: 'slug', current: 'birds-in-winter' },
  excerpt: lorem.en,
  body: [block(lorem.en), block('What to bring', 'h2'), ...bullets(['Binoculars', 'Field notebook']), block(lorem.en)],
  coverImage: image('article-birds', 'Sample image'),
  publishedAt: '2026-10-12',
  author: ref('author-main'),
  categories: [{ _key: key(), ...ref('category-fauna') }],
  tags: ['birdwatching', 'winter'],
});
linkTranslations('article-birds', 'article', { it: 'article-birds-it', en: 'article-birds-en' });

add({
  _id: 'article-trees-it',
  _type: 'article',
  language: 'it',
  title: 'Gli alberi monumentali [esempio, solo in italiano]',
  slug: { _type: 'slug', current: 'alberi-monumentali' },
  excerpt: lorem.it,
  body: [block(lorem.it)],
  coverImage: image('article-trees', 'Immagine di esempio'),
  publishedAt: '2026-08-03',
  author: ref('author-main'),
  categories: [{ _key: key(), ...ref('category-habitat') }],
  tags: ['alberi'],
});

// ─── Publications ────────────────────────────────────────────────────────────

const publications = [
  { id: 'paper', type: 'paper', title: '[Sample] Distribution of a wetland bird species in central Italy', authors: ['Dini A.', 'Rossi M.'], date: '2025-04-01', publisher: 'Example Journal of Ecology', citation: '12(3): 45–67', doi: '10.0000/example.0001' },
  { id: 'book', type: 'book', title: '[Esempio] Guida naturalistica di esempio', authors: ['Dini A.'], date: '2023-01-01', publisher: 'Editore di esempio', url: 'https://example.com/libro' },
  { id: 'popular', type: 'popular', title: '[Esempio] Articolo divulgativo', authors: ['Dini A.'], date: '2022-06-01', publisher: 'Rivista di esempio' },
];
for (const p of publications) {
  add({
    _id: `publication-${p.id}`,
    _type: 'publication',
    title: p.title,
    publicationType: p.type,
    authors: p.authors,
    publishedAt: p.date,
    publisher: p.publisher,
    ...(p.citation ? { citationDetails: p.citation } : {}),
    ...(p.doi ? { doi: p.doi } : {}),
    ...(p.url ? { url: p.url } : {}),
    description: { it: lorem.it.slice(0, 120), en: lorem.en.slice(0, 120) },
  });
}

// ─── Single pages ────────────────────────────────────────────────────────────

for (const lang of ['it', 'en']) {
  const it = lang === 'it';
  add({
    _id: `homePage-${lang}`,
    _type: 'homePage',
    heroImage: image('hero', it ? 'Immagine di esempio' : 'Sample image'),
    heroEyebrow: it ? 'Naturalista' : 'Naturalist',
    heroTitle: it ? 'Titolo di esempio *per la home*' : 'Sample *home page* title',
    heroText: lorem[lang],
    introTitle: it ? 'Presentazione *di esempio*' : 'Sample *introduction*',
    introText: lorem[lang],
    featuredProjects: projects.map((p) => ({ _key: key(), ...ref(`project-${p.id}-${lang}`) })),
    featuredPublications: publications.slice(0, 2).map((p) => ({ _key: key(), ...ref(`publication-${p.id}`) })),
    ctaTitle: it ? 'Hai un progetto *in mente*? [esempio]' : 'Have a project *in mind*? [sample]',
    ctaText: lorem[lang].slice(0, 80),
    ctaLabel: it ? 'Scrivimi' : 'Write to me',
  });

  add({
    _id: `biography-${lang}`,
    _type: 'biography',
    title: it ? 'Chi *sono*' : 'About *me*',
    introduction: lorem[lang],
    profileImage: image('portrait', it ? 'Ritratto di esempio' : 'Sample portrait'),
    body: [block(lorem[lang]), block(lorem[lang])],
    education: [
      { _key: key(), _type: 'timelineEntry', title: it ? '[Esempio] Laurea magistrale' : '[Sample] MSc degree', organization: it ? 'Università di esempio' : 'Example University', startYear: 2012, endYear: 2014 },
      { _key: key(), _type: 'timelineEntry', title: it ? '[Esempio] Laurea triennale' : '[Sample] BSc degree', organization: it ? 'Università di esempio' : 'Example University', startYear: 2009, endYear: 2012 },
    ],
    experience: [
      { _key: key(), _type: 'timelineEntry', title: it ? '[Esempio] Consulente ambientale' : '[Sample] Environmental consultant', organization: it ? 'Libero professionista' : 'Freelance', startYear: 2018, description: lorem[lang].slice(0, 100) },
      { _key: key(), _type: 'timelineEntry', title: it ? '[Esempio] Guida ambientale' : '[Sample] Nature guide', organization: '[Esempio] Ente Parco', startYear: 2014, endYear: 2018 },
    ],
    skills: [
      { _key: key(), _type: 'skillGroup', title: it ? 'Fauna' : 'Wildlife', items: it ? ['Avifauna', 'Erpetofauna'] : ['Birds', 'Reptiles and amphibians'] },
      { _key: key(), _type: 'skillGroup', title: 'GIS', items: ['QGIS'] },
    ],
    qualifications: [{ _key: key(), _type: 'qualification', title: it ? '[Esempio] Abilitazione' : '[Sample] Licence', issuer: '[Esempio] Ente', year: 2016 }],
  });

  add({
    _id: `page-privacy-${lang}`,
    _type: 'page',
    language: lang,
    title: it ? 'Privacy policy [esempio]' : 'Privacy policy [sample]',
    slug: { _type: 'slug', current: it ? 'privacy' : 'privacy-policy' },
    body: [block(lorem[lang]), block(it ? 'Titolare del trattamento' : 'Data controller', 'h2'), block(lorem[lang])],
    seo: { _type: 'seo', noIndex: true },
  });
}
linkTranslations('page-privacy', 'page', { it: 'page-privacy-it', en: 'page-privacy-en' });

writeFileSync(join(here, 'sample.ndjson'), `${docs.map((d) => JSON.stringify(d)).join('\n')}\n`);
console.log(`Wrote ${docs.length} documents to seed/sample.ndjson`);
