const { escapeHtml, gmailComposeHref } = require("./html");
const { renderShell } = require("./layout");

function renderLegalBody(html) {
  const sections = html
    .split(/(?=<h2>)/)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections
    .map((section) => `<section class="legal-section">
          ${section}
        </section>`)
    .join("\n\n");
}

function renderLegalPage(page, context) {
  const contactEmail = page.contactEmail === "privacy" ? context.site.privacyEmail : context.site.email;
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
        ${renderLegalBody(page.html)}
        <div class="legal-contact">
          <a class="btn btn-primary" href="${gmailComposeHref(contactEmail)}" target="_blank" rel="noopener">${escapeHtml(contactEmail)}</a>
        </div>
      </div>
    </section>
  </main>`;

  return renderShell({ page, context, body });
}

module.exports = {
  renderLegalPage
};
