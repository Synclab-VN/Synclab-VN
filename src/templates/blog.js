const { escapeHtml } = require("./html");
const { renderShell } = require("./layout");

function renderBlogPage(page, context) {
  const meta = [page.date, page.author].filter(Boolean).join(" · ");
  const tags = Array.isArray(page.tags) && page.tags.length
    ? `<div class="content-tags">${page.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";

  const body = `<main id="top">
    <article class="legal-content content-article">
      <div class="container legal-layout content-body">
        <p class="eyebrow">${escapeHtml(meta || "Synclab Blog")}</p>
        <h1>${escapeHtml(page.heading || page.title)}</h1>
        <p class="content-lead">${escapeHtml(page.description)}</p>
        ${tags}
        ${page.html}
      </div>
    </article>
  </main>`;

  return renderShell({ page, context, body });
}

module.exports = {
  renderBlogPage
};
