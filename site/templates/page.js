const { escapeHtml } = require("./html");
const { renderShell } = require("./layout");

function renderPage(page, context) {
  const body = `<main id="top">
    <section class="legal-hero">
      <div class="container">
        <p class="eyebrow">${escapeHtml(page.eyebrow || "Synclab")}</p>
        <h1>${escapeHtml(page.heading || page.title)}</h1>
        <p>${escapeHtml(page.description)}</p>
      </div>
    </section>

    <section class="legal-content">
      <article class="container legal-layout content-body">
        ${page.html}
      </article>
    </section>
  </main>`;

  return renderShell({ page, context, body });
}

module.exports = {
  renderPage
};
