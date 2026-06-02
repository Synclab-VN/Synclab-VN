const path = require("path");
const { paths, site, writeFile } = require("../context");
const { escapeHtml, gmailComposeHref } = require("../html");
const { renderShell } = require("../layout");

function renderSection(section) {
  return `<section class="legal-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}
        </section>`;
}

function renderLegalPage(locale, page) {
  const contactEmail = page.slug === "privacy-policy.html" ? site.privacyEmail : site.email;
  const body = `<main id="top">
    <section class="legal-hero">
      <div class="container">
        <p class="eyebrow">${escapeHtml(page.lastUpdated)}</p>
        <h1>${escapeHtml(page.heading)}</h1>
        <p>${escapeHtml(page.description)}</p>
      </div>
    </section>

    <section class="legal-content">
      <div class="container legal-layout">
        ${page.sections.map(renderSection).join("\n\n")}
        <div class="legal-contact">
          <a class="btn btn-primary" href="${gmailComposeHref(contactEmail)}" target="_blank" rel="noopener">${escapeHtml(contactEmail)}</a>
        </div>
      </div>
    </section>
  </main>`;

  return renderShell({
    locale,
    page,
    body
  });
}

function buildLegalPage(locale, page) {
  const outputDir = path.join(paths.outputRoot, locale.dir);
  writeFile(path.join(outputDir, page.slug), renderLegalPage(locale, page));
  return 1;
}

module.exports = {
  buildLegalPage
};
