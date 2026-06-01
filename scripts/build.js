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

function gmailComposeHref(email) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

function renderLanguageSwitcher(locale) {
  return site.languages
    .map((language) => {
      const current = language.code === locale.code ? ' aria-current="page"' : "";
      return `<a href="${relativeLocalePath(locale, language.path)}" hreflang="${language.code}"${current}>${language.label}</a>`;
    })
    .join("");
}

function renderFooterContact() {
  return `<div class="footer-contact" aria-label="Contact links">
        <a class="footer-contact-link" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener" aria-label="Email Synclab">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m4.5 7 7.5 6 7.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a class="footer-contact-link footer-contact-link-text" href="${escapeHtml(site.zaloUrl)}" target="_blank" rel="noopener" aria-label="Contact Synclab on Zalo">Zalo</a>
        <a class="footer-contact-link" href="tel:${escapeHtml(site.phone)}" aria-label="Call Synclab">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.6 3.8 9.3 6.5c.6.6.6 1.5.1 2.1l-1 1.2c1.1 2.3 3.7 4.9 6 6l1.2-1c.6-.5 1.5-.5 2.1.1l2.7 2.7c.5.5.6 1.3.2 1.9-.8 1.2-2.2 1.9-3.7 1.6C10.3 20 4 13.7 2.9 7.1 2.6 5.6 3.3 4.2 4.5 3.4c.6-.4 1.4-.3 2.1.4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>`;
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
    logo: site.logoImage,
    description: locale.meta.description,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressCountry: site.address.country
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

function renderMapLoaderScript() {
  return `<script>
  (function () {
    var map = document.querySelector("[data-map-src]");
    if (!map) return;

    function loadMap() {
      if (map.dataset.loaded === "true") return;
      map.src = map.dataset.mapSrc;
      map.dataset.loaded = "true";
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          loadMap();
          observer.disconnect();
        }
      }, { rootMargin: "240px" });
      observer.observe(map);
      return;
    }

    window.addEventListener("load", loadMap, { once: true });
  }());
  </script>`;
}

function renderHtml(locale) {
  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

${renderMeta(locale)}

  <link rel="icon" type="image/png" href="${relativeAsset(locale, "assets/synclab-logo.png")}" />
  <link rel="stylesheet" href="${relativeAsset(locale, "assets/site.css")}" />

  <script type="application/ld+json">
${renderJsonLd(locale)}
  </script>
</head>
<body>
  <header class="nav" aria-label="Main navigation">
    <div class="container nav-inner">
      <a class="brand" href="#top" aria-label="Synclab Home">
        <img class="brand-logo" src="${relativeAsset(locale, "assets/synclab-logo-nav@2x.png")}" alt="" width="42" height="40" />
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
        <a class="btn btn-primary" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener">${escapeHtml(locale.nav.cta)}</a>
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
            <p class="contact-address"><span>${escapeHtml(locale.contact.addressLabel)}:</span> ${escapeHtml(locale.contact.address)}</p>
          </div>
          <div class="contact-actions">
            <a class="btn btn-primary" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener">${escapeHtml(site.email)}</a>
            <a class="btn btn-secondary" href="tel:${escapeHtml(site.phone)}">${escapeHtml(site.phoneDisplay)}</a>
            <a class="btn btn-secondary" href="${escapeHtml(site.zaloUrl)}" target="_blank" rel="noopener">Zalo</a>
          </div>
        </div>
        <div class="contact-map">
          <iframe
            title="${escapeHtml(locale.contact.mapTitle)}"
            data-map-src="${escapeHtml(site.address.mapEmbedUrl)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen></iframe>
          <a class="map-link" href="${escapeHtml(site.address.mapLinkUrl)}" target="_blank" rel="noopener">${escapeHtml(locale.contact.mapLink)}</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container footer-inner">
      <div>${escapeHtml(locale.footer.copyright)}</div>
      <div class="footer-right">
        ${renderFooterContact()}
        <div class="footer-links">
          <a href="${relativeAsset(locale, "privacy-policy.html")}">${escapeHtml(locale.footer.privacy)}</a>
          <a href="${relativeAsset(locale, "terms.html")}">${escapeHtml(locale.footer.terms)}</a>
          <a href="${relativeAsset(locale, "support.html")}">${escapeHtml(locale.footer.support)}</a>
        </div>
      </div>
    </div>
  </footer>
  ${renderMapLoaderScript()}
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
for (const asset of fs.readdirSync(sourceAssetDir)) {
  fs.copyFileSync(path.join(sourceAssetDir, asset), path.join(outputAssetDir, asset));
}

for (const locale of locales) {
  writeLocale(locale);
}

console.log(`Generated ${locales.length} localized pages in docs/.`);
