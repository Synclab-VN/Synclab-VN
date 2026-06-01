# Synclab VN

Static multilingual website for Synclab.

## Languages

- Vietnamese: `/Synclab-VN/`
- English: `/Synclab-VN/en/`
- Korean: `/Synclab-VN/ko/`

## Maintain content

Do not edit generated HTML pages directly unless it is an urgent hotfix.

- Shared layout/build logic: `scripts/build.js`
- Shared site config: `src/locales/site.js`
- Vietnamese copy: `src/locales/vi.js`
- English copy: `src/locales/en.js`
- Korean copy: `src/locales/ko.js`
- Shared styles: `src/assets/site.css`

## Build

```bash
npm run build
```

The build writes static HTML to `docs/` for GitHub Pages:

- `docs/index.html`
- `docs/en/index.html`
- `docs/ko/index.html`
- `docs/assets/site.css`

Configure GitHub Pages to publish from branch `main` and folder `/docs`.
