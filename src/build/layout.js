const { site, locales } = require("./context");
const {
  absoluteUrl,
  escapeHtml,
  gmailComposeHref,
  relativeAsset,
  relativeHomePath,
  relativeLocalePath,
  relativePagePath
} = require("./html");

function renderLanguageSwitcher(locale, slug = "") {
  return locales
    .map((targetLocale) => {
      const current = targetLocale.code === locale.code ? ' aria-current="page"' : "";
      return `<a href="${relativeLocalePath(locale, targetLocale, slug)}" hreflang="${targetLocale.code}"${current}>${targetLocale.code.toUpperCase()}</a>`;
    })
    .join("");
}

function renderFooterContact(locale) {
  return `<div class="footer-contact" aria-label="${escapeHtml(locale.a11y.contactLinks)}">
        <a class="footer-contact-link" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener" aria-label="${escapeHtml(locale.a11y.email)}">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m4.5 7 7.5 6 7.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a class="footer-contact-link footer-contact-link-text" href="${escapeHtml(site.zaloUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(locale.a11y.zalo)}">Zalo</a>
        <a class="footer-contact-link" href="tel:${escapeHtml(site.phone)}" aria-label="${escapeHtml(locale.a11y.phone)}">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.6 3.8 9.3 6.5c.6.6.6 1.5.1 2.1l-1 1.2c1.1 2.3 3.7 4.9 6 6l1.2-1c.6-.5 1.5-.5 2.1.1l2.7 2.7c.5.5.6 1.3.2 1.9-.8 1.2-2.2 1.9-3.7 1.6C10.3 20 4 13.7 2.9 7.1 2.6 5.6 3.3 4.2 4.5 3.4c.6-.4 1.4-.3 2.1.4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>`;
}

function renderMeta(locale, page) {
  const canonical = absoluteUrl(locale, page.slug);
  const alternateLinks = locales
    .map((targetLocale) => {
      return `  <link rel="alternate" hreflang="${targetLocale.code}" href="${absoluteUrl(targetLocale, page.slug)}" />`;
    })
    .concat(`  <link rel="alternate" hreflang="x-default" href="${absoluteUrl(locales[0], page.slug)}" />`)
    .join("\n");

  return `  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  ${page.keywords ? `<meta name="keywords" content="${escapeHtml(page.keywords)}" />` : ""}
  <meta name="author" content="Synclab" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
${alternateLinks}

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(page.ogTitle || page.title)}" />
  <meta property="og:description" content="${escapeHtml(page.ogDescription || page.description)}" />
  <meta property="og:image" content="${site.ogImage}" />
  <meta property="og:locale" content="${locale.htmlLang}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(page.twitterTitle || page.title)}" />
  <meta name="twitter:description" content="${escapeHtml(page.twitterDescription || page.description)}" />
  <meta name="twitter:image" content="${site.ogImage}" />`;
}

function renderJsonLd(locale, description) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Synclab",
    url: site.baseUrl,
    logo: site.logoImage,
    description,
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

function renderHeader(locale, slug = "") {
  const home = relativeHomePath(locale);
  const navPrefix = slug ? home : "";

  return `<header class="nav" aria-label="${escapeHtml(locale.a11y.mainNavigation)}">
    <div class="container nav-inner">
      <a class="brand" href="${slug ? home : "#top"}" aria-label="${escapeHtml(locale.a11y.home)}">
        <img class="brand-logo" src="${relativeAsset(locale, "assets/synclab-logo-nav@2x.png")}" alt="" width="42" height="40" />
        <span>Synclab</span>
      </a>
      <nav class="nav-links" aria-label="${escapeHtml(locale.a11y.websiteNavigation)}">
        <a href="${navPrefix}#services">${escapeHtml(locale.nav.services)}</a>
        <a href="${navPrefix}#about">${escapeHtml(locale.nav.about)}</a>
        <a href="${navPrefix}#process">${escapeHtml(locale.nav.process)}</a>
        <a href="${relativePagePath(locale, "company-profile.html")}">${escapeHtml(locale.nav.companyProfile)}</a>
        <a href="${navPrefix}#contact">${escapeHtml(locale.nav.contact)}</a>
      </nav>
      <div class="nav-actions">
        <div class="language-switcher" aria-label="${escapeHtml(locale.a11y.languageSelector)}">
          ${renderLanguageSwitcher(locale, slug)}
        </div>
        <a class="btn btn-primary" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener">${escapeHtml(locale.nav.cta)}</a>
      </div>
    </div>
  </header>`;
}

function renderFooter(locale) {
  return `<footer>
    <div class="container footer-inner">
      <div>${escapeHtml(locale.footer.copyright)}</div>
      <div class="footer-right">
        ${renderFooterContact(locale)}
        <div class="footer-links">
          <a href="${relativePagePath(locale, "company-profile.html")}">${escapeHtml(locale.footer.companyProfile)}</a>
          <a href="${relativePagePath(locale, "privacy-policy.html")}">${escapeHtml(locale.footer.privacy)}</a>
          <a href="${relativePagePath(locale, "terms.html")}">${escapeHtml(locale.footer.terms)}</a>
          <a href="${relativePagePath(locale, "support.html")}">${escapeHtml(locale.footer.support)}</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderShell({ locale, page, body, afterFooter = "" }) {
  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

${renderMeta(locale, page)}

  <link rel="icon" type="image/png" href="${relativeAsset(locale, "assets/synclab-logo.png")}" />
  <link rel="stylesheet" href="${relativeAsset(locale, "assets/site.css")}" />

  <script type="application/ld+json">
${renderJsonLd(locale, page.description)}
  </script>
</head>
<body>
  ${renderHeader(locale, page.slug)}
  ${body}
  ${renderFooter(locale)}
  ${afterFooter}
</body>
</html>
`;
}

module.exports = {
  renderShell
};
