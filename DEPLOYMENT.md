# Deployment

How the website and the Studio go online, and how they stay up to date.

```
push to main ───────────────┐
                            ▼
Sanity "Publish" ──webhook──▶ Netlify build hook ──▶ npm run build ──▶ CDN
                                                      (reads Sanity at build time)
Sanity Studio ──npm run deploy:studio──▶ https://<hostname>.sanity.studio
```

| What | Where | Config |
| --- | --- | --- |
| Website | Netlify, from GitHub `main` | [`netlify.toml`](netlify.toml) |
| Under-construction mode | Netlify Edge Function | [`netlify/edge-functions/coming-soon.ts`](netlify/edge-functions/coming-soon.ts) |
| Contact form | Netlify Forms (form `contact`) | [`ContactForm.astro`](web/src/components/content/ContactForm.astro) |
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

## 4. Rebuild when content is published (Sanity → Netlify)

1. Netlify: *Project configuration → Build & deploy → Build hooks → Add build hook* —
   name `Sanity publish`, branch `main`. Copy the URL (treat it as a secret).
2. Sanity: <https://www.sanity.io/manage> → project → **API → Webhooks → Create webhook**:
   - Name: `Netlify build`
   - URL: the build hook URL
   - Dataset: `production`
   - Trigger on: **Create, Update, Delete**
   - Filter and projection: empty (drafts never trigger webhooks; only published changes)
   - HTTP method: `POST`
   - Enabled
3. Publish any change in the Studio and check *Netlify → Deploys*: a build "triggered by
   Sanity publish" starts within seconds and takes about a minute.

Several publishes in a row queue builds; Netlify runs them one after another. The free
plan includes 300 build minutes/month (about 300 publishes).

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

- [ ] Real content published in **production** for both languages: Impostazioni sito,
      Navigazione e footer, Home, Chi sono, Testi delle sezioni, Privacy policy page
      (and linked in *Impostazioni sito → Pagina della privacy policy*)
- [ ] Form detection on, email notification set, one test submission received
- [ ] Sanity webhook triggers a Netlify build
- [ ] Custom domain connected and primary, HTTPS active
- [ ] `COMING_SOON=false` + new deploy
- [ ] Check `https://<domain>/robots.txt` and `/sitemap-index.xml`; submit the sitemap in
      Google Search Console
