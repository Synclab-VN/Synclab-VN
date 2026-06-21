const path = require("path");
const { locales, paths, site, writeFile } = require("../context");
const { absoluteUrl, escapeHtml } = require("../html");

const pageSlugs = [
  "",
  "company-profile.html",
  "privacy-policy.html",
  "support.html",
  "terms.html"
];

function renderRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${site.baseUrl}/sitemap.xml
`;
}

function renderSitemapXml() {
  const urls = locales.flatMap((locale) => {
    return pageSlugs.map((slug) => ({
      loc: absoluteUrl(locale, slug),
      priority: slug ? "0.8" : locale.path === "/" ? "1.0" : "0.9"
    }));
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

function renderNotFoundPage() {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Không tìm thấy trang - Synclab</title>
  <meta name="robots" content="noindex" />
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #07111f;
      color: #edf5ff;
    }

    main {
      width: min(560px, calc(100% - 40px));
    }

    h1 {
      margin: 0 0 12px;
      font-size: 38px;
      line-height: 1.12;
    }

    p {
      margin: 0 0 24px;
      color: #adc0d7;
    }

    a {
      display: inline-flex;
      border-radius: 999px;
      padding: 12px 18px;
      background: #2563eb;
      color: #fff;
      font-weight: 700;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    <h1>Không tìm thấy trang</h1>
    <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
    <a href="/">Quay về trang chủ</a>
  </main>
</body>
</html>
`;
}

function buildStaticSeoFiles() {
  writeFile(path.join(paths.outputRoot, "robots.txt"), renderRobotsTxt());
  writeFile(path.join(paths.outputRoot, "sitemap.xml"), renderSitemapXml());
  writeFile(path.join(paths.outputRoot, "404.html"), renderNotFoundPage());
  return 3;
}

module.exports = {
  buildStaticSeoFiles
};
