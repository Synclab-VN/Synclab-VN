const { site } = require("./context");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function localeUrlPath(locale, slug = "") {
  const normalizedSlug = slug.replace(/^\//, "");
  if (!normalizedSlug) {
    return locale.path;
  }

  return locale.path === "/" ? `/${normalizedSlug}` : `${locale.path}${normalizedSlug}`;
}

function absoluteUrl(locale, slug = "") {
  const path = localeUrlPath(locale, slug);
  return `${site.baseUrl}${path === "/" ? "/" : path}`;
}

function relativePrefix(locale) {
  return locale.path === "/" ? "" : "../";
}

function relativeAsset(locale, asset) {
  return `${relativePrefix(locale)}${asset}`;
}

function relativeHomePath(currentLocale) {
  return currentLocale.path === "/" ? "./" : "../";
}

function relativeLocalePath(currentLocale, targetLocale, slug = "") {
  const normalizedSlug = slug.replace(/^\//, "");

  if (currentLocale.path === "/") {
    if (targetLocale.path === "/") {
      return normalizedSlug || "./";
    }
    return `${targetLocale.path.replace(/^\//, "")}${normalizedSlug}`;
  }

  if (targetLocale.path === "/") {
    return `../${normalizedSlug}`;
  }

  if (currentLocale.code === targetLocale.code) {
    return normalizedSlug || "./";
  }

  return `../${targetLocale.path.replace(/^\//, "")}${normalizedSlug}`;
}

function relativePagePath(locale, slug) {
  return slug;
}

function gmailComposeHref(email) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

module.exports = {
  escapeHtml,
  localeUrlPath,
  absoluteUrl,
  relativeAsset,
  relativeHomePath,
  relativeLocalePath,
  relativePagePath,
  gmailComposeHref
};
