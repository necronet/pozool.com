# Pozool Website

Marketing website and blog for **Pozool**, a hospitality-first property management platform for short- and long-term rentals.

This repository is built with [Astro](https://astro.build/) and contains the public-facing landing page, blog, legal pages, static assets, and Vercel deployment configuration.

## Overview

The site presents Pozool as a property management system focused on real rental operations, including:

- unified calendars
- payment tracking
- guest communication
- operations and maintenance workflows
- owner visibility
- operational reporting

The main landing page is bilingual (**English / Spanish**) and includes a client-side language toggle.

## Tech Stack

- **Astro 6** for site structure and page rendering
- **Node.js 22+** runtime
- **Vercel Analytics** for visitor analytics
- **Vercel** for deployment and host-based redirects
- **Static assets** served from `public/`
- **Vanilla CSS** embedded in `.astro` pages
- **Minimal client-side JavaScript** for language switching and page metadata updates

## Project Structure

```text
/
├── public/                     # Static assets: logos, team photos, demo images, favicon
├── src/
│   └── pages/
│       ├── index.astro         # Main marketing landing page
│       ├── privacy.astro       # Privacy policy
│       ├── terms.astro         # Terms of service
│       └── blog/
│           ├── index.astro     # Blog listing page
│           └── and-now-we-have-arrived-pozool-stays.astro
├── astro.config.mjs            # Astro config, local dev host
├── vercel.json                 # Vercel redirects for blog host behavior
├── package.json                # Scripts, engines, dependencies
└── README.md
```

## Pages

### `/`
Main Pozool landing page. Includes:
- product messaging
- features grid
- team section
- call-to-action
- language toggle for English and Spanish
- analytics integration

### `/blog`
Simple blog index page for company updates.

### `/blog/and-now-we-have-arrived-pozool-stays`
First published blog post introducing the blog and product direction.

### `/privacy` and `/terms`
Legal pages linked from the site footer.

## Local Development

### Requirements

- **Node.js >= 22.12.0**
- **npm**

### Install

```sh
npm install
```

### Run the development server

```sh
npm run dev
```

The Astro dev server is configured to use:

```text
http://pozool.local:4321
```

If `pozool.local` is not mapped on your machine, add it to your hosts file:

```text
127.0.0.1 pozool.local
```

Or temporarily change `server.host` in `astro.config.mjs` if needed.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Astro dev server |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run Astro CLI commands |

## Build Output

Production builds are generated in:

```text
dist/
```

This contains the static output that can be deployed to Vercel or any static hosting provider supported by Astro.

## Deployment

This project is configured for **Vercel**.

### Vercel details

- `@vercel/analytics` is included for analytics
- `vercel.json` contains host-based redirect rules for `blog.pozool.com`
- requests to `blog.pozool.com` are redirected to `/blog` routes on `pozool.com`

## Styling Approach

The site currently uses:

- page-local `<style>` blocks inside `.astro` files
- custom CSS variables for color, spacing, shadows, and gradients
- responsive layouts with media queries
- no external CSS framework

This keeps the project simple and suitable for a mostly static marketing site.

## Internationalization

The landing page supports two languages:

- English (`en`)
- Spanish (`es`)

Language switching is handled in the browser by:

- toggling `data-lang` on the root `<html>` element
- swapping visible text using `.i18n-en` and `.i18n-es` classes
- persisting the selected language in `localStorage`
- updating page title and meta description dynamically

## Assets

Images and other static files live in `public/`, including:

- brand assets
- hero imagery
- Airbnb-style demo screenshots
- team profile images
- favicon

These files are served directly at the site root.

## Analytics

The site uses Vercel Analytics via:

```astro
import Analytics from "@vercel/analytics/astro";
```

and renders it with:

```astro
<Analytics />
```

This is included on the landing page and blog pages.

## Notes for Contributors

- Keep the site content aligned with Pozool product messaging
- Prefer editing existing `.astro` pages directly for copy/layout changes
- Add new static assets to `public/`
- Keep bilingual content synchronized when updating the landing page
- Check responsive behavior when editing embedded CSS
- If adding blog posts, place them under `src/pages/blog/`

## Future Improvements

Possible enhancements for this repo:

- move shared layout markup into reusable Astro components
- extract repeated styles into a shared stylesheet
- add a content collection for blog posts
- improve SEO metadata consistency across pages
- add automated formatting/linting
- add tests for redirects and critical page rendering

## License

Private project for Pozool.
