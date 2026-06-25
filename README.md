# Synclab VN

Content-driven static website for Synclab.

## Source and Output

- Source: `src/`
- Build output: `docs/`
- GitHub Pages: publish from branch `main`, folder `/docs`

Do not edit generated HTML in `docs/` directly unless it is an urgent hotfix. Update content/config in `src/`, then run the build.

## Languages

- Vietnamese: `/`
- English: `/en/`
- Korean: `/ko/`

Vietnamese is the root language to preserve the current public URL structure.

## Content Structure

```text
src/
  config/
    site.json
    navigation.json
  content/
    pages/{vi,en,ko}/
    blog/{vi,en,ko}/
    services/{vi,en,ko}/
  templates/
  assets/
```

Pages, blog posts, and service pages are Markdown files with YAML front matter. Required front matter:

```yaml
title: "Page title"
description: "Page description"
lang: "vi"
translationKey: "shared-page-id"
slug: "example.html"
template: "page"
published: true
```

Supported templates:

- `home`
- `company-profile`
- `legal`
- `page`
- `blog`
- `service`

Use the same `translationKey` across translated versions so the build can generate `hreflang` links.

## Add Content

To add a normal page:

1. Add a Markdown file under `src/content/pages/{lang}/`.
2. Set required front matter.
3. Add translated versions with the same `translationKey` when available.
4. Run `npm run build`.

To add a blog post or service page, use `src/content/blog/{lang}/` or `src/content/services/{lang}/` and set `template: "blog"` or `template: "service"`.

## Build

```bash
npm run build
```

The build:

- reads Markdown/front matter from `src/content`,
- renders pages through shared templates,
- writes static HTML to `docs/`,
- copies public assets,
- generates `robots.txt`, `sitemap.xml`, `404.html`, canonical URLs, Open Graph, Twitter meta, and `hreflang`.
