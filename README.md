# Synclab VN

Static multilingual website for Synclab.

## Languages

- Vietnamese: `/`
- English: `/en/`
- Korean: `/ko/`

## Maintain content

Do not edit generated HTML pages directly unless it is an urgent hotfix.

- Build orchestrator: `scripts/build.js`
- Shared build helpers: `src/build/`
- Page builders: `src/build/pages/`
- Shared site config: `src/locales/site.js`
- Vietnamese copy: `src/locales/vi.js`
- English copy: `src/locales/en.js`
- Korean copy: `src/locales/ko.js`
- Legal/support page copy: `src/locales/pages/`
- Shared styles: `src/assets/site.css`

## Build

```bash
npm run build
```

The build writes static HTML to `docs/` for GitHub Pages:

- `docs/index.html`
- `docs/en/index.html`
- `docs/ko/index.html`
- `docs/company-profile.html`
- `docs/privacy-policy.html`
- `docs/support.html`
- `docs/terms.html`
- `docs/en/company-profile.html`
- `docs/en/privacy-policy.html`
- `docs/en/support.html`
- `docs/en/terms.html`
- `docs/ko/company-profile.html`
- `docs/ko/privacy-policy.html`
- `docs/ko/support.html`
- `docs/ko/terms.html`
- `docs/assets/site.css`

Configure GitHub Pages to publish from branch `main` and folder `/docs`.
