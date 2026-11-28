# IEEE Computer Society SBC of IIT — Website

Built with Next.js (App Router), React, TypeScript and Tailwind CSS, exported as a static site
and hosted on Cloudflare Pages. The volunteer forms and their admin panel run on Pages Functions
with D1 and R2 (see [Volunteer forms and admin panel](#volunteer-forms-and-admin-panel)).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Structure

- `app/` — routes (`/`, `/about`, `/events`, `/events/[slug]`, `/blog`, `/blog/[slug]`, `/contact`, `/volunteer`, `/admin`)
- `functions/` — Cloudflare Pages Functions: the forms API under `/api`
- `shared/forms.ts` — form definitions and validation, used by both the pages and the API
- `migrations/` — D1 database schema
- `app/_components/` — shared UI
- `app/_data/` — team members (edit `team.ts` to update the committee), plus the CMS loaders
- Events and blog posts come from the IEEE Student Branch site's Payload CMS (see below)
- `public/images/` — WebP images (each under 1 MB)

## Motion and the intro

All animation is driven by [anime.js](https://animejs.com) (v4).

- `app/_components/intro.tsx` is the opening animation: the CS disc zooms in and out, then flies onto the
  hero's disc (`#hero-disc`). It plays on the home page once per browser session. Open `/?intro` to replay
  it. Timings are at the bottom of that file; the gate logic is `introGateScript` in `app/_lib/motion.ts`.
- `app/_components/hero.tsx` is the landing hero. `reveal.tsx` (scroll reveals), `counter.tsx` (stats) and
  `navbar.tsx` (sliding highlight, mobile menu) use the same library.
- Everything respects `prefers-reduced-motion`, and the page works with JavaScript off.
- `public/images/ieee-cs-mark.webp` is a high-resolution, smooth version of the disc, used as a CSS mask
  (`.logo-mark`) so it can be any colour. Swap in a vector logo here if you have one.

## Merch store

`/merch` is a "coming soon" page (`app/merch/`). Edit the `shelf` list in `merch-preview.tsx` for the
placeholder products. When the store is ready, replace the page and drop the "soon" flags in
`navbar.tsx` and `footer.tsx`.

## Adding images

Drop images anywhere under `public/images/` (any format), then run:

```bash
npm run images
```

This converts them to WebP (max 1920px, under 1 MB) and refreshes `app/_data/image-sizes.json`,
which `<SiteImage>` uses for image dimensions.

## Events

Events are managed in the IEEE Student Branch site's CMS (`/admin` on that site), not in this repo.
This site reads its public API (`CMS_URL`, default `https://ieee.iit.ac.lk`) and shows events where:

- **Society** is only `CS` (joint events with other societies are excluded)
- **Show on Projects & Events page** is ticked

Blog posts are managed in the same CMS, under **Blogs**; only published posts appear.

The site is static, so CMS content is fetched when it's built. To pick up changes automatically, the
CMS triggers a rebuild through a Cloudflare Pages deploy hook after each CS event or blog post is saved
or deleted; the change is live in a minute or two. If the CMS is unreachable during a build, the build
fails and Pages keeps serving the previous deployment.

## Deploying (Cloudflare Pages)

Pages project settings (**Settings > Builds**):

- **Framework preset:** Next.js (Static HTML Export)
- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Node version:** from `.node-version` (22)
- **Environment variables:** `NEXT_PUBLIC_SITE_URL`, and optionally `CMS_URL`, `NEXT_PUBLIC_GA_ID`,
  `GOOGLE_SITE_VERIFICATION` (see `.env.example`)

Redirects for the old `.html` URLs are in `public/_redirects`, and cache and security headers in
`public/_headers`; Pages reads both from the build output.

To rebuild automatically on CMS changes, create a deploy hook (**Settings > Builds > Deploy hooks**,
branch `main`) and set its URL on the CMS server (`/root/srv/ieee-iit-site/.env`) as
`CS_SITE_REVALIDATE_URL`, leaving `CS_SITE_REVALIDATE_SECRET` blank. Each save starts one build, and
the free plan allows 500 builds a month.

## Environment

See `.env.example`. All values are read at build time, so set them as Pages environment variables.

## SEO

Everything crawlers, social cards and AI assistants read comes from `app/_lib/seo.ts`
(site name, description, URL, socials) and `app/_lib/jsonld.ts` (structured data).

- **Metadata:** every page has a title, description, canonical URL, Open Graph and Twitter card.
  Event and blog pages use their cover photo; the rest use `public/og-image.png`.
- **JSON-LD:** Organization and WebSite on every page, plus a breadcrumb and the page's own type:
  `Event` on event pages, `BlogPosting` on posts, `Blog`/`ItemList` on the lists, team members on About.
- **`/sitemap.xml`:** every page, event and post, with their photos as image entries.
- **`/robots.txt`:** everything allowed, AI crawlers allowed by name.
- **`/llms.txt`** and **`/llms-full.txt`:** a plain-text summary for AI assistants; the full
  version includes the text of every event and post.
- **`/manifest.webmanifest`**, favicons (`app/icon.png`, `app/apple-icon.png`) and `public/logo.png`.
- **Analytics:** Google Analytics 4 (`NEXT_PUBLIC_GA_ID`), production builds only.

After deploying, submit `https://<site>/sitemap.xml` in Google Search Console and check a few pages
with the [Rich Results Test](https://search.google.com/test/rich-results).

## Volunteer forms and admin panel

`/volunteer` is the volunteer application form, built into the site. Committee members build and
edit forms, open and close them, and review responses at `/admin`.

- **Forms:** create one from the 2026/27 volunteering template, a blank form, or a copy of an older
  one. Questions can be short/long text, email (optionally limited to `@iit.ac.lk`), phone, number,
  date, single/multiple choice, dropdown (with an "Other" box) and file upload (images, PDF, Word,
  up to 10 MB). A question can be shown only for certain answers to an earlier one (for example the
  proficiency document only for the design, writing, photo, dev and moderator teams). An optional
  deadline closes the form automatically, and "one response per" (e.g. IIT email) blocks duplicates.
- **Live editing is safe:** every save is a new version. Each response keeps the version it was
  answered against, so editing or deleting questions never loses earlier answers. Two people saving
  at once can't overwrite each other: the second gets a "reload" prompt.
- **Responses:** search, filter by status or by any answer, see a breakdown per choice (e.g. how many
  applied to each team), open a response to view photos/documents, mark it New / Shortlisted /
  Accepted / Rejected, add private notes, and export to CSV (opens in Excel and Google Sheets).
- **Activity:** every change in the admin panel is logged with who made it.
- **Reliability:** answers are checked by the same rules in the browser and on the server; uploaded
  files are checked by their contents, not their names. The browser keeps a draft of the answers, and
  a submission that fails on a bad connection is retried with the same id, so it is never saved twice.

When one form is open, `/volunteer` shows it directly; with several, it lists them. Each form also has
its own link, `/volunteer?f=<link-name>`.

### How it fits together

| Piece | What it is |
| --- | --- |
| `functions/api/forms/…` | Public API: list open forms, load one, submit a response |
| `functions/api/admin/…` | Admin API; every request goes through `_middleware.ts` (sign-in check) |
| D1 database `ieee-cs-forms` (binding `DB`) | Forms, form versions, responses, activity log |
| R2 bucket `ieee-cs-form-uploads` (binding `FILES`) | Uploaded files. Private; only served to admins |
| Cloudflare Access | Google sign-in in front of `/admin` and `/api/admin` |

### One-time setup (Cloudflare dashboard + terminal)

1. **Database and storage.** Log in with `npx wrangler login`, then:
   ```bash
   npx wrangler d1 create ieee-cs-forms          # copy the database_id into wrangler.toml
   npx wrangler r2 bucket create ieee-cs-form-uploads
   npm run db:migrate:remote                     # creates the tables
   ```
   Pages picks up the `DB` and `FILES` bindings from `wrangler.toml` on the next deploy (check
   **Settings > Bindings** on the Pages project).
2. **Admin sign-in (Cloudflare Access).** In **Zero Trust > Access > Applications**, add a
   *Self-hosted* application:
   - Domains: `csieeeiit.cloud` with paths `admin` and `api/admin`, **and** the same two paths on
     `<project>.pages.dev` (so the preview hostname is covered too).
   - Identity provider: Google (or one-time PIN by email).
   - Policy: *Allow*, include the committee's emails (or the `iit.ac.lk` domain plus a list).
   - Copy the application's **Audience (AUD) tag**, and your team domain
     (`<team>.cloudflareaccess.com`, under **Settings > Custom pages**).
3. **Pages environment variables** (**Settings > Variables and Secrets**, production):
   - `CF_ACCESS_TEAM_DOMAIN` = `<team>.cloudflareaccess.com`
   - `CF_ACCESS_AUD` = the AUD tag
   - Optional: `ADMIN_EMAILS` = comma-separated list, a second allow-list checked by the API
   - Optional: Turnstile bot check: create a widget under **Turnstile**, set
     `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (variable) and `TURNSTILE_SECRET_KEY` (secret)
4. Deploy, open `/admin`, sign in, create the form from the template, review it, and press **Open**.

The admin API checks the Access token itself as well. If Access is not set up, or the variables are
missing, the admin API refuses every request instead of being open.

### Running it locally

```bash
cp .dev.vars.example .dev.vars    # signs you in to the admin as DEV_ADMIN_EMAIL on localhost
npm run db:migrate:local          # once, creates a local database in .wrangler/
npm run dev:api                   # Functions + local D1/R2 on http://localhost:8788
npm run dev                       # the site on http://localhost:3000 (proxies /api to 8788)
```

Then open http://localhost:3000/admin. Local data lives in `.wrangler/` and never touches production.

### Backups

D1 keeps point-in-time history (7 days on the free plan, 30 on paid) (`npx wrangler d1 time-travel restore ieee-cs-forms`). For
an offline copy, export the database with `npx wrangler d1 export ieee-cs-forms --remote --output backup.sql`
or use **Export CSV** per form in the admin panel.
