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
- `app/_data/` — events, blog posts and team members. Edit these to update content.
- `public/images/` — WebP images (each under 1 MB)

## Adding images

Drop images anywhere under `public/images/` (any format), then run:

```bash
npm run images
```

This converts them to WebP (max 1920px, under 1 MB) and refreshes `app/_data/image-sizes.json`,
which `<SiteImage>` uses for image dimensions.

Set `NEXT_PUBLIC_SITE_URL` in production so social preview images get absolute URLs.
