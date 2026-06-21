const fs = require("fs");
const path = require("path");

const site = require("../locales/site");
const locales = [
  require("../locales/vi"),
  require("../locales/en"),
  require("../locales/ko")
];

const root = path.resolve(__dirname, "..", "..");
const outputRoot = path.join(root, "docs");
const sourceAssetDir = path.join(root, "src", "assets");
const outputAssetDir = path.join(outputRoot, "assets");
const preservedOutputFiles = ["CNAME"];
const sourceOnlyAssets = new Set([
  "apple-touch-icon.png",
  "favicon.ico",
  "synclab-logo-seo.png",
  "synclab-logo.svg"
]);

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
    fs.writeFileSync(path.join(outputRoot, preservedFile.file), preservedFile.content);
  }
}

function copyAssets() {
  for (const asset of fs.readdirSync(sourceAssetDir)) {
    if (sourceOnlyAssets.has(asset)) {
      continue;
    }

    fs.copyFileSync(path.join(sourceAssetDir, asset), path.join(outputAssetDir, asset));
  }
}

function writeFile(outputPath, html) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
}

module.exports = {
  site,
  locales,
  paths: {
    root,
    outputRoot,
    sourceAssetDir,
    outputAssetDir
  },
  cleanOutput,
  copyAssets,
  writeFile
};
