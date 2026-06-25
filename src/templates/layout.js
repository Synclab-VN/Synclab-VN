const {
  absoluteUrl,
  escapeHtml,
  gmailComposeHref,
  relativeAsset,
  relativePath
} = require("./html");

function translationFor(context, page, languageCode) {
  const translations = context.translations.get(page.translationKey) || new Map();
  return translations.get(languageCode);
}

function renderLanguageSwitcher(page, context) {
  return context.site.languages
    .map((language) => {
      const translatedPage = translationFor(context, page, language.code);
      const href = translatedPage
        ? relativePath(page, language, translatedPage.slug)
        : relativePath(page, language, "");
      const current = language.code === page.lang ? ' aria-current="page"' : "";
      return `<a href="${href}" hreflang="${language.code}"${current}>${language.code.toUpperCase()}</a>`;
    })
    .join("");
}

function renderFooterContact(page, context) {
  const { site } = context;
  const navigation = context.navigation[page.lang];

  return `<div class="footer-contact" aria-label="${escapeHtml(navigation.a11y.contactLinks)}">
        <a class="footer-contact-link" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener" aria-label="${escapeHtml(navigation.a11y.email)}">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m4.5 7 7.5 6 7.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a class="footer-contact-link footer-contact-link-text" href="${escapeHtml(site.zaloUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(navigation.a11y.zalo)}">Zalo</a>
        <a class="footer-contact-link" href="tel:${escapeHtml(site.phone)}" aria-label="${escapeHtml(navigation.a11y.phone)}">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.6 3.8 9.3 6.5c.6.6.6 1.5.1 2.1l-1 1.2c1.1 2.3 3.7 4.9 6 6l1.2-1c.6-.5 1.5-.5 2.1.1l2.7 2.7c.5.5.6 1.3.2 1.9-.8 1.2-2.2 1.9-3.7 1.6C10.3 20 4 13.7 2.9 7.1 2.6 5.6 3.3 4.2 4.5 3.4c.6-.4 1.4-.3 2.1.4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>`;
}

function renderMeta(page, context) {
  const canonical = page.canonical || absoluteUrl(context.site, page.language, page.slug);
  const ogUrl = page.ogUrl || canonical;
  const translations = context.translations.get(page.translationKey) || new Map([[page.lang, page]]);
  const xDefaultPage = translationFor(context, page, context.defaultLanguage.code) || [...translations.values()][0] || page;
  const alternateLinks = [...translations.values()]
    .map((translatedPage) => {
      return `  <link rel="alternate" hreflang="${translatedPage.lang}" href="${absoluteUrl(context.site, translatedPage.language, translatedPage.slug)}" />`;
    })
    .concat(`  <link rel="alternate" hreflang="x-default" href="${absoluteUrl(context.site, xDefaultPage.language, xDefaultPage.slug)}" />`)
    .join("\n");

  return `  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  ${page.keywords ? `<meta name="keywords" content="${escapeHtml(page.keywords)}" />` : ""}
  <meta name="author" content="Synclab" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
${alternateLinks}

  <meta property="og:type" content="${escapeHtml(page.ogType || "website")}" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:title" content="${escapeHtml(page.ogTitle || page.title)}" />
  <meta property="og:description" content="${escapeHtml(page.ogDescription || page.description)}" />
  <meta property="og:image" content="${context.site.ogImage}" />
  <meta property="og:locale" content="${page.language.htmlLang}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(page.twitterTitle || page.title)}" />
  <meta name="twitter:description" content="${escapeHtml(page.twitterDescription || page.description)}" />
  <meta name="twitter:image" content="${context.site.ogImage}" />`;
}

function stringifyJsonLd(payload) {
  return JSON.stringify(payload, null, 2).replace(/</g, "\\u003c");
}

function renderJsonLdBlocks(page, context) {
  const organizationPayload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Synclab",
    url: context.site.baseUrl,
    logo: context.site.logoImage,
    description: page.description,
    email: context.site.email,
    telephone: context.site.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: context.site.address.locality,
      addressCountry: context.site.address.country
    },
    sameAs: []
  };

  const payloads = [organizationPayload];
  if (page.schema) {
    payloads.push(page.schema);
  }

  return payloads
    .map((payload) => `  <script type="application/ld+json">\n${stringifyJsonLd(payload)}\n  </script>`)
    .join("\n");
}

function renderHeader(page, context) {
  const navigation = context.navigation[page.lang];
  const homeHref = relativePath(page, page.language, "");
  const navPrefix = page.slug ? homeHref : "";

  return `<header class="nav" aria-label="${escapeHtml(navigation.a11y.mainNavigation)}">
    <div class="container nav-inner">
      <a class="brand" href="${page.slug ? homeHref : "#top"}" aria-label="${escapeHtml(navigation.a11y.home)}">
        <img class="brand-logo" src="${relativeAsset(page, "assets/synclab-logo-nav@2x.png")}" alt="" width="42" height="40" />
        <span>Synclab</span>
      </a>
      <nav class="nav-links" aria-label="${escapeHtml(navigation.a11y.websiteNavigation)}">
        <a href="${navPrefix}#services">${escapeHtml(navigation.nav.services)}</a>
        <a href="${navPrefix}#about">${escapeHtml(navigation.nav.about)}</a>
        <a href="${navPrefix}#process">${escapeHtml(navigation.nav.process)}</a>
        <a href="${relativePath(page, page.language, "company-profile.html")}">${escapeHtml(navigation.nav.companyProfile)}</a>
        <a href="${navPrefix}#contact">${escapeHtml(navigation.nav.contact)}</a>
      </nav>
      <div class="nav-actions">
        <div class="language-switcher" aria-label="${escapeHtml(navigation.a11y.languageSelector)}">
          ${renderLanguageSwitcher(page, context)}
        </div>
        <a class="btn btn-primary" href="${gmailComposeHref(context.site.email)}" target="_blank" rel="noopener">${escapeHtml(navigation.nav.cta)}</a>
      </div>
    </div>
  </header>`;
}

function renderFooter(page, context) {
  const navigation = context.navigation[page.lang];

  return `<footer>
    <div class="container footer-inner">
      <div>${escapeHtml(navigation.footer.copyright)}</div>
      <div class="footer-right">
        ${renderFooterContact(page, context)}
        <div class="footer-links">
          <a href="${relativePath(page, page.language, "company-profile.html")}">${escapeHtml(navigation.footer.companyProfile)}</a>
          <a href="${relativePath(page, page.language, "privacy-policy.html")}">${escapeHtml(navigation.footer.privacy)}</a>
          <a href="${relativePath(page, page.language, "terms.html")}">${escapeHtml(navigation.footer.terms)}</a>
          <a href="${relativePath(page, page.language, "support.html")}">${escapeHtml(navigation.footer.support)}</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderShell({ page, context, body, afterFooter = "" }) {
  return `<!DOCTYPE html>
<html lang="${page.language.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

${renderMeta(page, context)}

  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="${relativeAsset(page, "assets/site.css")}" />

${renderJsonLdBlocks(page, context)}
</head>
<body>
  ${renderHeader(page, context)}
  ${body}
  ${renderFooter(page, context)}
  ${afterFooter}
</body>
</html>
`;
}

module.exports = {
  renderShell
};
