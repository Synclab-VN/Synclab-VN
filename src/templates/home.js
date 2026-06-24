const { escapeHtml, gmailComposeHref, relativeAsset, relativePath } = require("./html");
const { renderShell } = require("./layout");

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

function renderHeroHighlights(page) {
  return page.hero.highlights
    .map((highlight) => {
      const icon = highlight.iconImage
        ? `<div class="metric-icon"><img src="${relativeAsset(page, highlight.iconImage)}" alt="" loading="lazy" /></div>`
        : "";

      return `<div class="metric">${icon}
              <div>
                <strong>${escapeHtml(highlight.title)}</strong>
                <span>${escapeHtml(highlight.text)}</span>
              </div>
            </div>`;
    })
    .join("\n            ");
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

function renderHomePage(page, context) {
  const { site } = context;
  const body = `<main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="eyebrow">${escapeHtml(page.hero.eyebrow)}</div>
          <h1>${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.description)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#contact">${escapeHtml(page.hero.primaryCta)}</a>
            <a class="btn btn-secondary" href="#services">${escapeHtml(page.hero.secondaryCta)}</a>
            <a class="btn btn-secondary" href="${relativePath(page, page.language, "company-profile.html")}">${escapeHtml(page.hero.profileCta)}</a>
          </div>
        </div>

        <aside class="hero-card" aria-label="${escapeHtml(page.hero.highlightsLabel)}">
          <div class="dashboard">
            ${renderHeroHighlights(page)}
          </div>
        </aside>
      </div>
    </section>

    <section id="about">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(page.about.title)}</h2>
          <p>${escapeHtml(page.about.description)}</p>
        </div>
        <div class="grid-3">
${renderCards(page.about.cards)}
        </div>
      </div>
    </section>

    <section id="services">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(page.services.title)}</h2>
          <p>${escapeHtml(page.services.description)}</p>
        </div>
        <div class="grid-2">
${renderCards(page.services.cards)}
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(page.products.title)}</h2>
          <p>${escapeHtml(page.products.description)}</p>
        </div>
        <div class="grid-3">
${renderCards(page.products.cards)}
        </div>
      </div>
    </section>

    <section id="process">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(page.process.title)}</h2>
          <p>${escapeHtml(page.process.description)}</p>
        </div>
        <div class="process">
${renderProcess(page.process.steps)}
        </div>
      </div>
    </section>

    <section>
      <div class="container profile-teaser">
        <div>
          <h2>${escapeHtml(page.profileTeaser.title)}</h2>
          <p>${escapeHtml(page.profileTeaser.description)}</p>
        </div>
        <a class="btn btn-secondary" href="${relativePath(page, page.language, "company-profile.html")}">${escapeHtml(page.profileTeaser.cta)}</a>
      </div>
    </section>

    <section id="contact">
      <div class="container">
        <div class="cta">
          <div>
            <h2>${escapeHtml(page.contact.title)}</h2>
            <p>${escapeHtml(page.contact.description)}</p>
            <p class="contact-address"><span>${escapeHtml(page.contact.addressLabel)}:</span> ${escapeHtml(page.contact.address)}</p>
          </div>
          <div class="contact-actions">
            <a class="btn btn-primary" href="${gmailComposeHref(site.email)}" target="_blank" rel="noopener">${escapeHtml(site.email)}</a>
            <a class="btn btn-secondary" href="tel:${escapeHtml(site.phone)}">${escapeHtml(site.phoneDisplay)}</a>
            <a class="btn btn-secondary" href="${escapeHtml(site.zaloUrl)}" target="_blank" rel="noopener">Zalo</a>
          </div>
        </div>
        <div class="contact-map">
          <iframe
            title="${escapeHtml(page.contact.mapTitle)}"
            data-map-src="${escapeHtml(site.address.mapEmbedUrl)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen></iframe>
          <a class="map-link" href="${escapeHtml(site.address.mapLinkUrl)}" target="_blank" rel="noopener">${escapeHtml(page.contact.mapLink)}</a>
        </div>
      </div>
    </section>
  </main>`;

  return renderShell({
    page,
    context,
    body,
    afterFooter: renderMapLoaderScript()
  });
}

module.exports = {
  renderHomePage
};
