# IEEE Computer Society SBC of IIT — Website

Built with Next.js (App Router), React, TypeScript and Tailwind CSS, exported as a static site
and hosted on Cloudflare Pages.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Structure

- `app/` — routes (`/`, `/about`, `/events`, `/events/[slug]`, `/blog`, `/blog/[slug]`, `/contact`)
- `app/_components/` — shared UI
- `app/_data/` — team members (edit `team.ts` to update the committee), plus the CMS loaders
- Events and blog posts come from the IEEE Student Branch site's Payload CMS (see below)
- `public/images/` — WebP images (each under 1 MB)

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
