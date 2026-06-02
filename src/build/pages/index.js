const path = require("path");
const { site, paths, writeFile } = require("../context");
const { escapeHtml, gmailComposeHref } = require("../html");
const { renderShell } = require("../layout");

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
    .map((step) => `          <div class="process-item"><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div></div>`)
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

function renderHomepage(locale) {
  const body = `<main id="top">
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
  </main>`;

  return renderShell({
    locale,
    page: {
      slug: "",
      title: locale.meta.title,
      description: locale.meta.description,
      keywords: locale.meta.keywords,
      ogTitle: locale.meta.ogTitle,
      ogDescription: locale.meta.ogDescription,
      twitterTitle: locale.meta.twitterTitle,
      twitterDescription: locale.meta.twitterDescription
    },
    body,
    afterFooter: renderMapLoaderScript()
  });
}

function buildIndexPage(locale) {
  const outputDir = path.join(paths.outputRoot, locale.dir);
  writeFile(path.join(outputDir, "index.html"), renderHomepage(locale));
  return 1;
}

module.exports = {
  buildIndexPage
};
