const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const YAML = require("yaml");

const { renderHomePage } = require("./templates/home");
const { renderCompanyProfilePage } = require("./templates/company-profile");
const { renderLegalPage } = require("./templates/legal");
const { renderPage } = require("./templates/page");
const { renderBlogPage } = require("./templates/blog");
const { renderServicePage } = require("./templates/service");
const { absoluteUrl, escapeHtml, outputRelativePath } = require("./templates/html");

const root = path.resolve(__dirname, "..");
const siteRoot = path.join(root, "site");
const outputRoot = path.join(root, "docs");
const sourceAssetDir = path.join(siteRoot, "assets");
const outputAssetDir = path.join(outputRoot, "assets");
const contentRoot = path.join(siteRoot, "content");
const preservedOutputFiles = ["CNAME"];
const sourceOnlyAssets = new Set([
  "apple-touch-icon.png",
  "favicon.ico",
  "synclab-logo-seo.png",
  "synclab-logo.svg"
]);

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const templates = {
  home: renderHomePage,
  "company-profile": renderCompanyProfilePage,
  legal: renderLegalPage,
  page: renderPage,
  blog: renderBlogPage,
  service: renderServicePage
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFile(outputPath, content) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

function cleanOutput() {
  const preservedFiles = preservedOutputFiles
    .map((file) => {
      const outputPath = path.join(outputRoot, file);
      return fs.existsSync(outputPath)
        ? { file, content: fs.readFileSync(outputPath) }
        : null;
    })
    .filter(Boolean);

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputAssetDir, { recursive: true });

  for (const preservedFile of preservedFiles) {
    writeFile(path.join(outputRoot, preservedFile.file), preservedFile.content);
  }
}

function copyAssets() {
  copyDirectory(sourceAssetDir, outputAssetDir, (file) => !sourceOnlyAssets.has(path.basename(file)));
}

function copyDirectory(sourceDir, targetDir, shouldCopy = () => true) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirectory(sourcePath, targetPath, shouldCopy);
      continue;
    }

    if (entry.isFile() && shouldCopy(sourcePath)) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function collectMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectMarkdownFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function parseMarkdownFile(file) {
  const source = fs.readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`${file} is missing YAML front matter`);
  }

  return {
    data: YAML.parse(match[1]) || {},
    content: match[2] || ""
  };
}

function validatePage(page, sourcePath, languages) {
  const required = ["title", "description", "lang", "translationKey", "template"];
  const missing = required.filter((field) => !page[field]);

  if (missing.length) {
    throw new Error(`${sourcePath} is missing front matter: ${missing.join(", ")}`);
  }

  if (!languages.has(page.lang)) {
    throw new Error(`${sourcePath} uses unsupported lang: ${page.lang}`);
  }

  if (!templates[page.template]) {
    throw new Error(`${sourcePath} uses unsupported template: ${page.template}`);
  }

  if (page.slug === undefined || page.slug === null) {
    throw new Error(`${sourcePath} is missing front matter: slug`);
  }
}

function loadContent(context) {
  const languageMap = new Map(context.site.languages.map((language) => [language.code, language]));
  const files = collectMarkdownFiles(contentRoot);
  const pages = files.flatMap((file) => {
    const parsed = parseMarkdownFile(file);
    const page = {
      ...parsed.data,
      body: parsed.content.trim(),
      html: markdown.render(parsed.content.trim()),
      sourcePath: path.relative(root, file).split(path.sep).join("/")
    };

    if (page.published === false) {
      return [];
    }

    validatePage(page, file, languageMap);

    return [{
      ...page,
      slug: page.slug || "",
      collection: path.relative(contentRoot, file).split(path.sep)[0],
      language: languageMap.get(page.lang)
    }];
  });

  const translations = new Map();
  for (const page of pages) {
    if (!translations.has(page.translationKey)) {
      translations.set(page.translationKey, new Map());
    }

    const group = translations.get(page.translationKey);
    if (group.has(page.lang)) {
      throw new Error(`Duplicate translationKey/lang pair: ${page.translationKey}/${page.lang}`);
    }
    group.set(page.lang, page);
  }

  return { pages, translations };
}

function renderPages(context) {
  let count = 0;
  for (const page of context.pages) {
    const render = templates[page.template];
    const html = render(page, context);
    writeFile(path.join(outputRoot, outputRelativePath(page.language, page.slug)), html);
    count += 1;
  }
  return count;
}

function renderRobotsTxt(site) {
  return `User-agent: *
Allow: /

Sitemap: ${site.baseUrl}/sitemap.xml
`;
}

function renderSitemapXml(context) {
  const urls = context.pages
    .filter((page) => page.sitemap !== false)
    .sort((a, b) => absoluteUrl(context.site, a.language, a.slug).localeCompare(absoluteUrl(context.site, b.language, b.slug)))
    .map((page) => {
      const priority = page.priority || (page.slug ? "0.8" : page.language.path === "/" ? "1.0" : "0.9");
      return `  <url>
    <loc>${escapeHtml(absoluteUrl(context.site, page.language, page.slug))}</loc>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
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

function buildStaticSeoFiles(context) {
  writeFile(path.join(outputRoot, "robots.txt"), renderRobotsTxt(context.site));
  writeFile(path.join(outputRoot, "sitemap.xml"), renderSitemapXml(context));
  writeFile(path.join(outputRoot, "404.html"), renderNotFoundPage());
  return 3;
}

function readLogoPath() {
  const source = fs.readFileSync(path.join(sourceAssetDir, "synclab-logo.svg"), "utf8");
  const pathMatch = source.match(/<path\b([\s\S]*?)\/?>/i);

  if (!pathMatch) {
    throw new Error("Could not find logo path in site/assets/synclab-logo.svg");
  }

  const attributes = pathMatch[1];
  const dMatch = attributes.match(/\sd="([^"]+)"/i);
  const styleMatch = attributes.match(/\sstyle="([^"]+)"/i);

  if (!dMatch) {
    throw new Error("Could not find logo path data in site/assets/synclab-logo.svg");
  }

  return {
    d: dMatch[1],
    style: styleMatch ? styleMatch[1] : "fill:#01e0fa;stroke:#fdfafa;stroke-width:2;stroke-linecap:round;paint-order:fill markers stroke"
  };
}

function renderFaviconSvg() {
  const logoPath = readLogoPath();
  const viewBoxWidth = 164.57303;
  const sourceHeight = 158.49815;
  const verticalOffset = ((viewBoxWidth - sourceHeight) / 2).toFixed(5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 ${viewBoxWidth} ${viewBoxWidth}" role="img" aria-labelledby="title">
  <title id="title">Synclab</title>
  <g transform="translate(0 ${verticalOffset})">
    <path style="${logoPath.style}" d="${logoPath.d}" />
  </g>
</svg>
`;
}

function buildBrandAssets() {
  writeFile(path.join(outputRoot, "favicon.svg"), renderFaviconSvg());
  fs.copyFileSync(path.join(sourceAssetDir, "favicon.ico"), path.join(outputRoot, "favicon.ico"));
  fs.copyFileSync(path.join(sourceAssetDir, "apple-touch-icon.png"), path.join(outputRoot, "apple-touch-icon.png"));

  fs.mkdirSync(path.join(outputAssetDir, "logo"), { recursive: true });
  fs.copyFileSync(
    path.join(sourceAssetDir, "synclab-logo-seo.png"),
    path.join(outputAssetDir, "logo", "synclab-logo.png")
  );

  return 4;
}

function buildSite() {
  const site = readJson(path.join(siteRoot, "config", "site.json"));
  const navigation = readJson(path.join(siteRoot, "config", "navigation.json"));
  const defaultLanguage = site.languages.find((language) => language.path === "/") || site.languages[0];
  const content = loadContent({ site, navigation });
  const context = {
    site,
    navigation,
    defaultLanguage,
    pages: content.pages,
    translations: content.translations
  };

  cleanOutput();
  copyAssets();

  const generatedPages = renderPages(context);
  const generatedStaticFiles = buildStaticSeoFiles(context);
  const generatedBrandAssets = buildBrandAssets();

  return {
    generatedPages,
    generatedStaticFiles,
    generatedBrandAssets
  };
}

module.exports = {
  buildSite
};
