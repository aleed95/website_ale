# Alessandro Dini — website

Professional website for Alessandro Dini, independent naturalist.
Bilingual (Italian default, English under `/en/`), statically generated, content managed in Sanity.

| Part | Technology | Where it runs |
| --- | --- | --- |
| Website (`web/`) | [Astro](https://astro.build) 7, static output, TypeScript strict | Netlify (CDN) |
| CMS (`studio/`) | [Sanity Studio](https://www.sanity.io) 6 | `https://<hostname>.sanity.studio` (free Sanity hosting) |
| Content | Sanity Content Lake (dataset `production`) | Sanity |
| Source / CI | GitHub → Netlify automatic deploys | GitHub, Netlify |

> **Project status — Phase 2 (CMS integration).** Every page reads its content from Sanity,
> in both languages, including project, article and generic pages. Visual design of the
> pages is refined in Phase 3. Netlify configuration (`netlify.toml`, contact form)
> arrives in Phase 4; the steps below already describe it.

---

## Architecture at a glance

```
GitHub (main) ──push──▶ Netlify build ──▶ static HTML/CSS on CDN
                             ▲
Sanity Studio ──publish──▶ Sanity webhook ──▶ Netlify build hook
                             │
              build reads content via GROQ (server side, at build time only)
```

- **No JavaScript framework on the website.** Astro components only; the only client JS is
  the ~0.5 KB mobile-menu script. React exists only inside Sanity Studio, which is a
  separate app.
- **Content is read at build time.** Visitors never call Sanity; no token reaches the
  browser.
- **The Studio is deployed separately** on Sanity's free hosting, so the website does not
  need React or a server adapter.

### Languages and URLs

Italian is the default and lives at the root; English lives under `/en/`. Section URLs are
translated and defined once in [`web/src/i18n/config.ts`](web/src/i18n/config.ts):

| Section | Italian | English |
| --- | --- | --- |
| Home | `/` | `/en/` |
| About | `/chi-sono/` | `/en/about/` |
| Services | `/servizi/` | `/en/services/` |
| Projects | `/progetti/` (+ `/progetti/<slug>/`) | `/en/projects/` |
| Publications | `/pubblicazioni/` | `/en/publications/` |
| Articles | `/articoli/` (+ `/articoli/<slug>/`) | `/en/articles/` |
| Contact | `/contatti/` | `/en/contact/` |

Every page emits `hreflang` alternates and a canonical URL; the language switcher links
to the translated page when it exists, otherwise to the other language's home page.

### How translations are stored in Sanity

| Content | Approach | Why |
| --- | --- | --- |
| Services, projects, articles, pages | One document per language, linked by the official `@sanity/document-internationalization` plugin | Each version has its own slug, SEO and rich text |
| Home, Chi sono, Testi delle sezioni | One fixed document per language (`homePage-it`, `biography-en`, `sectionPages-it`…) | Single pages: no lists, nothing to create or delete |
| Site settings, navigation & footer, categories, author bio | Shared document with IT/EN fields side by side | Short labels: editing both languages in one place is simpler |
| Publications | Shared document; only the description has IT/EN | Titles of scientific works stay in their original language |

---

## Repository structure

```
.
├── package.json            # npm workspaces: web + studio, root scripts
├── web/                    # Astro website
│   ├── astro.config.mjs    # i18n, fonts, typed env vars, sitemap
│   ├── public/             # favicon (brand pictogram)
│   └── src/
│       ├── assets/brand/   # logos from the brand manual (SVG, colours inlined)
│       ├── components/
│       │   ├── layout/     # SiteHeader, SiteFooter, LanguageSwitcher, Seo
│       │   ├── ui/         # Container, Button, placeholders
│       │   └── home/
│       ├── i18n/           # locales, translated routes, UI strings
│       ├── layouts/        # BaseLayout (head, header, main, footer)
│       ├── lib/
│       │   ├── sanity/     # client, image URLs, GROQ queries, generated types
│       │   └── *.ts        # links/translations, SEO fallbacks, dates, static paths
│       ├── views/          # one template per page type, shared by IT and EN routes
│       ├── pages/          # thin route files: Italian at root, English in pages/en/
│       └── styles/         # tokens.css (brand design tokens), global.css
└── studio/                 # Sanity Studio
    ├── sanity.config.ts    # plugins, singletons, document actions
    ├── sanity.cli.ts
    ├── lib/                # env, languages, validation helpers
    ├── structure/          # sidebar organisation for the editor
    ├── seed/               # sample content for the `development` dataset
    └── schemaTypes/
        ├── documents/      # siteSettings, navigation, homePage, biography, service,
        │                   # project, article, publication, category, author, page
        └── objects/        # localeString/Text, accessibleImage, blockContent, seo,
                            # navLink, socialLink, timeline/skills/qualifications
```

### Design system

All visual values live in [`web/src/styles/tokens.css`](web/src/styles/tokens.css) and come
from the brand manual: palette (Floral White, Cornsilk, Charcoal Brown, Ebony, Dry Sage,
Pale Sky, Burnt Caramel), typefaces (Fraunces for headings, Geologica for text), fluid type
scale, spacing, layout widths and minimum logo sizes. Components only use semantic tokens
(`--color-bg`, `--color-text`, `--color-accent`…).

Fonts are downloaded by Astro at build time and served from the site itself (no requests
to Google from visitors' browsers — better for privacy and performance).

---

## Requirements

- Node.js **24** (see `.nvmrc`; minimum 22.12, required by Astro 7 and Sanity 6)
- npm 11
- Access to the Sanity project, the Netlify site and the GitHub repository

## Install

```bash
npm install
```

One install at the root sets up both workspaces.

## Environment variables

Each app reads its own `.env` file. Copy the examples and fill them in:

```bash
cp web/.env.example web/.env
```

```bash
cp studio/.env.example studio/.env
```

| Variable | App | Secret? | Description |
| --- | --- | --- | --- |
| `SANITY_PROJECT_ID` | web | no | Sanity project ID |
| `SANITY_DATASET` | web | no | Dataset, default `production` |
| `SANITY_API_VERSION` | web | no | Pinned API date, default `2026-11-01` |
| `SANITY_API_READ_TOKEN` | web | **yes** | Optional. Only if the dataset is private (Viewer token) |
| `SITE_URL` | web | no | Public URL, no trailing slash. On Netlify falls back to `URL` |
| `SANITY_STUDIO_PROJECT_ID` | studio | no | Same project ID |
| `SANITY_STUDIO_DATASET` | studio | no | Same dataset |
| `SANITY_STUDIO_HOSTNAME` | studio | no | Studio hostname → `https://<hostname>.sanity.studio` |

**Datasets per mode.** `astro dev` and `sanity dev` also load `.env.development`, which
switches local development to the `development` dataset (sample content). Builds and the
deployed Studio use `.env` → `production`:

```bash
echo "SANITY_DATASET=development" > web/.env.development
```

```bash
echo "SANITY_STUDIO_DATASET=development" > studio/.env.development
```

Rules:

- `.env` files are git-ignored. Never commit real values.
- Never put a token in a `SANITY_STUDIO_*` or `PUBLIC_*` variable: those are bundled into
  browser code.
- Website variables are declared and type-checked in `astro.config.mjs` (`env.schema`).

## Local development

```bash
npm run dev           # website → http://localhost:4321
```

```bash
npm run dev:studio    # Sanity Studio → http://localhost:3333
```

Useful scripts (run from the root):

| Script | What it does |
| --- | --- |
| `npm run check` | `astro check` on the website + TypeScript check on the Studio |
| `npm run build` | Type-check and build the website into `web/dist` |
| `npm run build:studio` | Build the Studio into `studio/dist` |
| `npm run deploy:studio` | Deploy the Studio to `<hostname>.sanity.studio` |
| `npm run typegen` | Re-generate `web/src/lib/sanity/sanity.types.ts` from the schema and the GROQ queries |
| `npm run seed --workspace studio` | Replace the `development` dataset with the sample content in `studio/seed/` |

### Working with content queries

- All GROQ queries live in [`web/src/lib/sanity/queries.ts`](web/src/lib/sanity/queries.ts),
  wrapped in `defineQuery`.
- After changing a query or a schema, run `npm run typegen`: the result types are
  generated (and committed) in `sanity.types.ts`, and `client.fetch(QUERY)` is typed
  automatically.
- Content is fetched only at build time; global documents (settings, navigation, section
  texts) are fetched once per language per build.
- Images go through [`SanityImage.astro`](web/src/components/content/SanityImage.astro):
  responsive `srcset`, AVIF/WebP from the Sanity CDN, explicit dimensions, lazy loading,
  blurred placeholder.

### Sample content

`studio/seed/build-sample.mjs` generates clearly labelled fake content ("[Esempio]",
"[Sample]") with placeholder images. It is imported **only** into the `development` dataset,
which must exist first:

```bash
npm exec --workspace studio -- sanity dataset create development --visibility public
```

```bash
npm run seed --workspace studio
```

Validate the content model at any time:

```bash
npm exec --workspace studio -- sanity schema validate
```

---

## Sanity project setup (one time)

1. Go to <https://www.sanity.io/manage>, open the client's project and copy the
   **Project ID** into `web/.env` and `studio/.env`.
2. **Datasets:** make sure a dataset named `production` exists, with **public**
   visibility (content is public on the website anyway; no token is then needed to build).
3. **API → CORS origins:** add `http://localhost:3333` with *Allow credentials* checked
   (needed to run the Studio locally). The hosted Studio URL is added automatically on
   deploy.
4. Log in once from the CLI: `npm exec --workspace studio -- sanity login`.
5. Start the Studio locally (`npm run dev:studio`), then deploy it:
   `npm run deploy:studio`. The first deploy asks for (or uses `SANITY_STUDIO_HOSTNAME`)
   the hostname.
6. **Members:** invite the naturalist with the **Administrator** role.
7. In the Studio, fill in **Impostazioni sito**, **Navigazione e footer**, **Home** and
   **Chi sono** for both languages.

### Editor guide (short)

- The sidebar is organised by section. Translated content (Servizi, Progetti, Articoli,
  Pagine) is split into **Italiano** and **English**.
- To translate a document, open it and use the **Translations** menu (language icon) in
  the document header: it creates the linked version in the other language.
- Every image asks for **alternative text**: a short description of what it shows.
- Nothing appears on the website until you press **Publish**. Each publish rebuilds the
  site in about one to two minutes.

---

## Netlify deployment

> `netlify.toml` is added in Phase 4. Until then these are the target settings.

1. Netlify → **Add new site → Import an existing project → GitHub** → pick this repository.
2. Build settings (will be pinned in `netlify.toml`):
   - Base directory: *(repository root)*
   - Build command: `npm run build`
   - Publish directory: `web/dist`
   - Environment: `NODE_VERSION=24`
3. **Site configuration → Environment variables:** add `SANITY_PROJECT_ID`,
   `SANITY_DATASET`, `SANITY_API_VERSION`, `SITE_URL` (and `SANITY_API_READ_TOKEN` only if
   the dataset is private — mark it as secret).
4. Production branch: `main`. Every push to `main` triggers a deploy; pull requests get
   deploy previews.

## Rebuild on publish (Sanity → Netlify webhook)

1. Netlify → **Site configuration → Build & deploy → Build hooks → Add build hook**.
   Name it `Sanity publish`, branch `main`. Copy the URL.
   Treat this URL as a secret: anyone who has it can trigger builds.
2. Sanity → <https://www.sanity.io/manage> → project → **API → Webhooks → Create webhook**:
   - URL: the Netlify build hook URL
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - Filter: leave empty (drafts never trigger webhooks; only published changes do)
   - HTTP method: `POST`, no projection, API version `v2025-02-19` or later
3. Publish a test change and watch the deploy start in Netlify → **Deploys**.

## Contact form (planned, Phase 4)

Recommended: **Netlify Forms** — works with static HTML, built-in spam filtering
(Akismet) plus a honeypot field, optional reCAPTCHA, email notifications to the address
of your choice, 100 submissions/month on the free plan. The email recipient is configured
in Netlify, not in code, so it can change at any time. If more volume or a custom email
provider is needed later, the form can post to a Netlify Function using any transactional
email service instead.

---

## Conventions

- Strict TypeScript everywhere (`astro/tsconfigs/strictest` for the website).
- Code, comments and commit messages in English; Studio labels and help texts in Italian
  for the editor.
- No editorial text in code: UI strings (menu labels, accessibility labels) live in
  `web/src/i18n/ui.ts`; everything else comes from Sanity.
- Branches: `main` is production. Work on feature branches and open pull requests to get
  a Netlify deploy preview.
