const fs = require("fs");
const path = require("path");

const site = require("../src/locales/site");
const locales = [
  require("../src/locales/vi"),
  require("../src/locales/en"),
  require("../src/locales/ko")
];

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "docs");
const sourceAssetDir = path.join(root, "src", "assets");
const outputAssetDir = path.join(outputRoot, "assets");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absoluteUrl(localePath) {
  return `${site.baseUrl}${localePath === "/" ? "/" : localePath}`;
}

function relativePrefix(locale) {
  return locale.path === "/" ? "" : "../";
}

function relativeLocalePath(currentLocale, targetPath) {
  if (currentLocale.path === "/") {
    if (targetPath === "/") {
      return "./";
    }
    return targetPath.replace(/^\//, "");
  }

  if (targetPath === "/") {
    return "../";
  }

  return `../${targetPath.replace(/^\//, "")}`;
}

function relativeAsset(locale, asset) {
  return `${relativePrefix(locale)}${asset}`;
}

function renderLanguageSwitcher(locale) {
  return site.languages
    .map((language) => {
      const current = language.code === locale.code ? ' aria-current="page"' : "";
      return `<a href="${relativeLocalePath(locale, language.path)}" hreflang="${language.code}"${current}>${language.label}</a>`;
    })
    .join("");
}

function renderMeta(locale) {
  const canonical = absoluteUrl(locale.path);
  const alternateLinks = site.languages
    .map((language) => {
      return `  <link rel="alternate" hreflang="${language.code}" href="${absoluteUrl(language.path)}" />`;
    })
    .concat(`  <link rel="alternate" hreflang="x-default" href="${absoluteUrl("/")}" />`)
    .join("\n");

  return `  <title>${escapeHtml(locale.meta.title)}</title>
  <meta name="description" content="${escapeHtml(locale.meta.description)}" />
  <meta name="keywords" content="${escapeHtml(locale.meta.keywords)}" />
  <meta name="author" content="Synclab" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
${alternateLinks}

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(locale.meta.ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(locale.meta.ogDescription)}" />
  <meta property="og:image" content="${site.ogImage}" />
  <meta property="og:locale" content="${locale.htmlLang}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(locale.meta.twitterTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(locale.meta.twitterDescription)}" />
  <meta name="twitter:image" content="${site.ogImage}" />`;
}

function renderJsonLd(locale) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Synclab",
    url: site.baseUrl,
    logo: `${site.baseUrl}/logo.png`,
    description: locale.meta.description,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "VN"
    },
    sameAs: []
  };

  return JSON.stringify(payload, null, 2);
}

function renderCards(cards) {
  return cards
    .map((card) => {
      const icon = card.icon ? `\n            <div class="icon">${card.icon}</div>` : "";
      const items = card.items
        ? `\n            <ul>${card.items.map((item) => `\n              <li>${escapeHtml(item)}</li>`).join("")}\n            </ul>`
        : "";
      return `          <article class="card">${icon}
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.text)}</p>${items}
          </article>`;
    })
    .join("\n\n");
}

function renderProcess(steps) {
  return steps
    .map((step) => {
      return `          <div class="process-item"><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div></div>`;
    })
    .join("\n");
}

function renderHtml(locale) {
  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

${renderMeta(locale)}

  <link rel="icon" href="${relativeAsset(locale, "favicon.ico")}" />
  <link rel="stylesheet" href="${relativeAsset(locale, "assets/site.css")}" />

  <script type="application/ld+json">
${renderJsonLd(locale)}
  </script>
</head>
<body>
  <header class="nav" aria-label="Main navigation">
    <div class="container nav-inner">
      <a class="brand" href="#top" aria-label="Synclab Home">
        <span class="brand-mark">S</span>
        <span>Synclab</span>
      </a>
      <nav class="nav-links" aria-label="Website navigation">
        <a href="#services">${escapeHtml(locale.nav.services)}</a>
        <a href="#about">${escapeHtml(locale.nav.about)}</a>
        <a href="#process">${escapeHtml(locale.nav.process)}</a>
        <a href="#contact">${escapeHtml(locale.nav.contact)}</a>
      </nav>
      <div class="nav-actions">
        <div class="language-switcher" aria-label="Language selector">
          ${renderLanguageSwitcher(locale)}
        </div>
        <a class="btn btn-primary" href="mailto:${site.email}">${escapeHtml(locale.nav.cta)}</a>
      </div>
    </div>
  </header>

  <main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="eyebrow">${escapeHtml(locale.hero.eyebrow)}</div>
          <h1>${escapeHtml(locale.hero.title)}</h1>
          <p>${escapeHtml(locale.hero.description)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#contact">${escapeHtml(locale.hero.primaryCta)}</a>
            <a class="btn btn-secondary" href="#services">${escapeHtml(locale.hero.secondaryCta)}</a>
          </div>
        </div>

        <aside class="hero-card" aria-label="${escapeHtml(locale.hero.highlightsLabel)}">
          <div class="dashboard">
            ${locale.hero.highlights.map((highlight) => `<div class="metric">
              <strong>${escapeHtml(highlight.title)}</strong>
              <span>${escapeHtml(highlight.text)}</span>
            </div>`).join("\n            ")}
          </div>
        </aside>
      </div>
    </section>

    <section id="about">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(locale.about.title)}</h2>
          <p>${escapeHtml(locale.about.description)}</p>
        </div>
        <div class="grid-3">
${renderCards(locale.about.cards)}
        </div>
      </div>
    </section>

    <section id="services">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(locale.services.title)}</h2>
          <p>${escapeHtml(locale.services.description)}</p>
        </div>
        <div class="grid-2">
${renderCards(locale.services.cards)}
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(locale.products.title)}</h2>
          <p>${escapeHtml(locale.products.description)}</p>
        </div>
        <div class="grid-3">
${renderCards(locale.products.cards)}
        </div>
      </div>
    </section>

    <section id="process">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(locale.process.title)}</h2>
          <p>${escapeHtml(locale.process.description)}</p>
        </div>
        <div class="process">
${renderProcess(locale.process.steps)}
        </div>
      </div>
    </section>

    <section id="contact">
      <div class="container">
        <div class="cta">
          <div>
            <h2>${escapeHtml(locale.contact.title)}</h2>
            <p>${escapeHtml(locale.contact.description)}</p>
          </div>
          <a class="btn btn-primary" href="mailto:${site.email}">${site.email}</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container footer-inner">
      <div>${escapeHtml(locale.footer.copyright)}</div>
      <div class="footer-links">
        <a href="${relativeAsset(locale, "privacy-policy.html")}">${escapeHtml(locale.footer.privacy)}</a>
        <a href="${relativeAsset(locale, "terms.html")}">${escapeHtml(locale.footer.terms)}</a>
        <a href="${relativeAsset(locale, "support.html")}">${escapeHtml(locale.footer.support)}</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

function writeLocale(locale) {
  const outputDir = path.join(outputRoot, locale.dir);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), renderHtml(locale));
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputAssetDir, { recursive: true });
fs.copyFileSync(path.join(sourceAssetDir, "site.css"), path.join(outputAssetDir, "site.css"));

for (const locale of locales) {
  writeLocale(locale);
}

console.log(`Generated ${locales.length} localized pages in docs/.`);
