const path = require("path");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pagePath(language, slug = "") {
  const normalizedSlug = slug.replace(/^\//, "");
  if (!normalizedSlug) {
    return language.path;
  }

  return language.path === "/" ? `/${normalizedSlug}` : `${language.path}${normalizedSlug}`;
}

function absoluteUrl(site, language, slug = "") {
  const targetPath = pagePath(language, slug);
  return `${site.baseUrl}${targetPath === "/" ? "/" : targetPath}`;
}

function outputRelativePath(language, slug = "") {
  const normalizedSlug = slug.replace(/^\//, "");
  const base = language.dir ? `${language.dir}/` : "";
  if (!normalizedSlug) {
    return `${base}index.html`;
  }

  return normalizedSlug.endsWith("/")
    ? `${base}${normalizedSlug}index.html`
    : `${base}${normalizedSlug}`;
}

function relativePath(fromPage, targetLanguage, targetSlug = "") {
  const fromDir = path.posix.dirname(outputRelativePath(fromPage.language, fromPage.slug));
  const targetPath = outputRelativePath(targetLanguage, targetSlug);
  const relative = path.posix.relative(fromDir === "." ? "" : fromDir, targetPath);
  return relative || "./";
}

function relativeAsset(page, assetPath) {
  const fromDir = path.posix.dirname(outputRelativePath(page.language, page.slug));
  const targetPath = assetPath.replace(/^\//, "");
  const relative = path.posix.relative(fromDir === "." ? "" : fromDir, targetPath);
  return relative || targetPath;
}

function gmailComposeHref(email) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

module.exports = {
  absoluteUrl,
  escapeHtml,
  gmailComposeHref,
  outputRelativePath,
  pagePath,
  relativeAsset,
  relativePath
};
