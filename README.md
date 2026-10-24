# IEEE Computer Society SBC of IIT — Website

Built with Next.js (App Router), React, TypeScript and Tailwind CSS.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure

- `app/` — routes (`/`, `/about`, `/events`, `/events/[slug]`, `/blog`, `/blog/[slug]`, `/contact`)
- `app/_components/` — shared UI
- `app/_data/` — blog posts and team members (edit these to update content), plus the CMS events loader
- Events come from the IEEE Student Branch site's Payload CMS (see below)
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

Changes show up immediately: the CMS calls `POST /api/revalidate` after each CS event is saved or deleted,
which clears this site's event cache. Pages also refresh every 5 minutes as a fallback. If the CMS is
unreachable during a refresh, the last good copy keeps being served.

To turn on immediate updates, set the same random secret on both sites:

- this site: `REVALIDATE_SECRET`
- CMS server (`/root/srv/ieee-iit-site/.env`): `CS_SITE_REVALIDATE_SECRET`, plus
  `CS_SITE_REVALIDATE_URL=https://<this site>/api/revalidate`

## Environment

See `.env.example`. Set `NEXT_PUBLIC_SITE_URL` in production so social preview images get absolute URLs.
