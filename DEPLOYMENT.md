# Deployment

How the website and the Studio go online, and how they stay up to date.

```
push to main ───────────────┐
                            ▼
Studio "Aggiorna il sito" ──e-mail──▶ developer ──Trigger deploy──▶ npm run build ──▶ CDN
Studio "Anteprima" tab ──▶ /anteprima/* (Netlify Function, drafts, never cached)
Sanity Studio ──npm run deploy:studio──▶ https://<hostname>.sanity.studio
```

| What | Where | Config |
| --- | --- | --- |
| Website | Netlify, from GitHub `main` | [`netlify.toml`](netlify.toml) |
| Under-construction mode | Netlify Edge Function | [`netlify/edge-functions/coming-soon.ts`](netlify/edge-functions/coming-soon.ts) |
| Contact form | Netlify Forms (form `contact`) | [`ContactForm.astro`](web/src/components/content/ContactForm.astro) |
| Studio preview (drafts, click-to-edit) | Netlify Function via `@astrojs/netlify` | [`web/src/pages/anteprima/[...path].astro`](web/src/pages/anteprima/%5B...path%5D.astro), [`web/src/middleware.ts`](web/src/middleware.ts) |
| "Aggiorna il sito" request | Netlify Forms (form `richiesta-aggiornamento`) | [`studio/tools/RequestPublishTool.tsx`](studio/tools/RequestPublishTool.tsx) |
| Studio | Sanity hosting | [`studio/sanity.cli.ts`](studio/sanity.cli.ts) |

---

## 1. Netlify site (one time)

1. <https://app.netlify.com> → **Add new project → Import an existing project → GitHub**,
   authorise Netlify on the GitHub account that owns the repository, pick the repository.
2. Build settings are read from `netlify.toml` — leave the form fields as Netlify fills them:
   - base directory: repository root
   - build command: `npm run build`
   - publish directory: `web/dist`
   - Node 24; only the `web` workspace is installed (the Studio is not needed to build)
3. Before the first deploy, **add environment variables** (or later in *Project
   configuration → Environment variables*):

   | Key | Value | Notes |
   | --- | --- | --- |
   | `COMING_SOON` | `true` | Shows "Sito in costruzione" to visitors. Set `false` at launch. |
   | `PREVIEW_SECRET` | long random string | Mark as **secret**. Generate it with `openssl rand -hex 24`. |
   | `SANITY_API_READ_TOKEN` | — | Only if the dataset becomes private. Secret. |

   `SANITY_PROJECT_ID`, `SANITY_DATASET` and `SANITY_API_VERSION` are already in
   `netlify.toml` (not secret). `SITE_URL` is not needed: Netlify's `URL` variable (the
   primary domain) is used for canonical URLs and the sitemap.
   For `COMING_SOON` and `PREVIEW_SECRET`, the variable **scope must include
   Edge Functions** (the default "All scopes" is fine).
4. **Deploy.** Every push to `main` deploys production; pull requests get deploy previews.

## 2. Under-construction mode

While `COMING_SOON=true`:

- visitors get the page `/in-costruzione/` with status **503** (temporarily unavailable)
  and `noindex`; `robots.txt` disallows everything;
- you open **`https://<site>/?anteprima=<PREVIEW_SECRET>`** once per browser: a 30-day
  cookie lets that browser see the real site (still `noindex`);
- `https://<site>/?anteprima=esci` removes the cookie, to see what visitors see.

**Launch:** set `COMING_SOON` to `false` (or delete it) and **Deploys → Trigger deploy →
Deploy site**. Environment variable changes only apply to new deploys.

It is a convenience gate, like WordPress maintenance mode, not access control: share the
secret link only with people who should preview the site.

## 3. Contact form notifications

1. *Project configuration → Forms* → **Enable form detection**, then trigger a new deploy
   (forms are detected in the built HTML at deploy time).
2. After the deploy, the form **contact** appears under *Forms*.
3. *Forms → Form notifications → Add notification → Email notification*: form `contact`,
   recipient = the naturalist's address. Change it here at any time, no code involved.
4. Spam: Netlify filters submissions with Akismet; the hidden `company` field is a
   honeypot. Suspected spam lands in *Forms → contact → Spam submissions*.
5. Free plan: 100 submissions/month.

Submissions only work on Netlify (not on `npm run dev`). While `COMING_SOON=true`, test the
form from a browser unlocked with the secret link.

## 4. Publishing content (manual rebuild) and the Studio preview

Netlify's credit-based Free plan includes **300 credits/month** and every production
deploy costs **15 credits** (~18 deploys/month once traffic is counted). The site is
therefore **not** rebuilt automatically on every publish:

- **Articles, projects and services go online by themselves**: their pages, the
  home-page "projects" and "latest articles" blocks (server islands) and
  `/sitemap-contenuti.xml` are rendered on demand and cached on Netlify's CDN for 5
  minutes. Published content is live within ~5 minutes, with no deploy and no build
  credits. (The home "services" overview is static and updates with the next deploy.)
- The editor works in the Studio and sees every change — drafts included — in the
  **Anteprima** tab (live preview, click-to-edit). This uses no build.
- The Studio is also reachable at **`/admin`** on the website (redirect), and its top bar
  has **Nuovo articolo** and **Nuovo progetto** shortcuts.
- When done, the editor opens **Aggiorna il sito** in the Studio and sends a request:
  the developer receives an e-mail (Netlify form `richiesta-aggiornamento`).
- The developer publishes: *Netlify → Deploys → Trigger deploy → Deploy project*
  (or `curl -X POST -d '{}' <build hook URL>`).

One-time setup:

1. **Read token** — sanity.io/manage → API → Tokens: a token with role **Viewer**
   ("Anteprima sito"). Add it on Netlify as `SANITY_API_READ_TOKEN` (secret) and locally
   in `web/.env`.
2. **`PREVIEW_SECRET`** on Netlify (already used by the under-construction mode) also
   signs the preview cookie. Scope must include **Functions** and **Edge Functions**.
3. **Notification** — after the first deploy, *Forms → richiesta-aggiornamento → Form
   notifications → Email notification* to the developer's address.
4. The Sanity webhook "Netlify build" stays **disabled** (sanity.io/manage → API →
   Webhooks). Re-enable it only on a paid plan, to rebuild on every publish.

How the preview works: `/anteprima/*` pages are rendered on demand by a Netlify Function
(`@astrojs/netlify` adapter; the rest of the site stays static). The Studio opens
`/api/anteprima/attiva/` with a one-time secret, validated with the read token; a cookie
signed with `PREVIEW_SECRET` (SameSite=None, Partitioned, 8 h) then lets the framed site
read drafts. Preview responses are `noindex`, `private, no-store`, and may be framed only
by the Studio (`https://alessandrodini.sanity.studio`, also when opened inside the Sanity
Dashboard on `https://www.sanity.io`) and `http://localhost:3333`. Function usage costs
compute credits (fractions of a credit per page view), not deploys.

Local preview: run `npm run dev` and `npm run dev:studio`, open the Studio's Anteprima tab
(`studio/.env.development` points it to `http://localhost:4321`; `http://localhost:3333`
must be a CORS origin with credentials in sanity.io/manage).

## 5. Sanity Studio

1. Choose the Studio hostname (→ `https://<hostname>.sanity.studio`) and set it in
   `studio/.env` as `SANITY_STUDIO_HOSTNAME`.
2. `npm run deploy:studio` (logged in with `npm exec --workspace studio -- sanity login`).
   The deployed Studio uses the `production` dataset (`studio/.env`).
3. Redeploy the Studio after every schema change.
4. *sanity.io/manage → Members → Invite*: the naturalist, role **Administrator**.

## 6. Custom domain (at launch)

*Netlify → Domain management → Add a domain*, follow the DNS instructions (Netlify DNS
or a CNAME/A record at the registrar). HTTPS certificates are automatic. Make the custom
domain the **primary domain**: canonical URLs and the sitemap follow it on the next build.

## Launch checklist

- [ ] Remove the sample content shown during the preview (dry run first, then `--apply`):
      `npm run seed:clean --workspace studio -- --dataset production`
      Only documents still marked "[esempio]" / "[sample]" are deleted; single pages
      (Home, Chi sono, Testi delle sezioni, Navigazione) are listed for rewriting instead.
- [ ] Real content published in **production** for both languages: Impostazioni sito,
      Navigazione e footer, Home, Chi sono, Testi delle sezioni, Privacy policy page
      (and linked in *Impostazioni sito → Pagina della privacy policy*)
- [ ] Form detection on, email notification set, one test submission received
- [ ] Preview works from the Studio's Anteprima tab; "Aggiorna il sito" e-mail received
- [ ] Custom domain connected and primary, HTTPS active
- [ ] `COMING_SOON=false` + new deploy
- [ ] Check `https://<domain>/robots.txt` and `/sitemap-index.xml`; submit the sitemap in
      Google Search Console
