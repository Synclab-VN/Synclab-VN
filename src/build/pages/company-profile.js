const path = require("path");
const { paths, site, writeFile } = require("../context");
const { escapeHtml, gmailComposeHref } = require("../html");
const { renderShell } = require("../layout");

const pagesByLocale = {
  vi: require("../../locales/pages/vi").companyProfile,
  en: require("../../locales/pages/en").companyProfile,
  ko: require("../../locales/pages/ko").companyProfile
};

function renderParagraphs(items) {
  return items.map((item) => `<p>${escapeHtml(item)}</p>`).join("\n          ");
}

function renderCards(items) {
  return items
    .map((item) => `<article class="profile-card">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>`)
    .join("\n\n");
}

function renderList(items) {
  return `<ul class="profile-list">
            ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n            ")}
          </ul>`;
}

function renderSteps(items) {
  return `<div class="profile-steps">
            ${items.map((item) => `<div class="profile-step">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.text)}</p>
            </div>`).join("\n            ")}
          </div>`;
}

function renderSection(section) {
  const intro = section.description ? `<p>${escapeHtml(section.description)}</p>` : "";
  let content = "";

  if (section.type === "cards") {
    content = `<div class="profile-grid">${renderCards(section.items)}</div>`;
  } else if (section.type === "list") {
    content = renderList(section.items);
  } else if (section.type === "steps") {
    content = renderSteps(section.items);
  } else {
    content = renderParagraphs(section.body);
  }

  const id = section.id ? ` id="${escapeHtml(section.id)}"` : "";

  return `<section${id} class="profile-section">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(section.title)}</h2>
          ${intro}
        </div>
        ${content}
      </div>
    </section>`;
}

function renderCompanyProfilePage(locale, page) {
  const body = `<main id="top">
    <section class="profile-hero">
      <div class="container profile-hero-inner">
        <div>
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p>${escapeHtml(page.description)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener">${escapeHtml(page.primaryCta)}</a>
            <a class="btn btn-secondary" href="#app-development">${escapeHtml(page.secondaryCta)}</a>
          </div>
        </div>
        <aside class="profile-summary" aria-label="${escapeHtml(page.summaryLabel)}">
          ${page.summary.map((item) => `<div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </div>`).join("\n          ")}
        </aside>
      </div>
    </section>

    ${page.sections.map(renderSection).join("\n\n")}

    <section id="contact" class="profile-section">
      <div class="container">
        <div class="cta">
          <div>
            <h2>${escapeHtml(page.contact.title)}</h2>
            <p>${escapeHtml(page.contact.description)}</p>
          </div>
          <div class="contact-actions">
            <a class="btn btn-primary" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener">${escapeHtml(site.email)}</a>
            <a class="btn btn-secondary" href="tel:${escapeHtml(site.phone)}">${escapeHtml(site.phoneDisplay)}</a>
          </div>
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

function buildCompanyProfilePage(locale) {
  const page = pagesByLocale[locale.code];
  const outputDir = path.join(paths.outputRoot, locale.dir);
  writeFile(path.join(outputDir, page.slug), renderCompanyProfilePage(locale, page));
  return 1;
}

module.exports = {
  buildCompanyProfilePage
};
