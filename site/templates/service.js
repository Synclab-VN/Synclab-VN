const { escapeHtml, gmailComposeHref } = require("./html");
const { renderShell } = require("./layout");

function renderServicePage(page, context) {
  const body = `<main id="top">
    <section class="profile-hero">
      <div class="container">
        <p class="eyebrow">${escapeHtml(page.eyebrow || "Synclab Service")}</p>
        <h1>${escapeHtml(page.heading || page.title)}</h1>
        <p>${escapeHtml(page.description)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${gmailComposeHref(context.site.email)}" target="_blank" rel="noopener">${escapeHtml(page.primaryCta || context.site.email)}</a>
        </div>
      </div>
    </section>

    <section class="profile-section">
      <article class="container legal-layout content-body">
        ${page.html}
      </article>
    </section>
  </main>`;

  return renderShell({ page, context, body });
}

module.exports = {
  renderServicePage
};
