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

function cleanOutput() {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputAssetDir, { recursive: true });
}

function copyAssets() {
  for (const asset of fs.readdirSync(sourceAssetDir)) {
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
    outputRoot
  },
  cleanOutput,
  copyAssets,
  writeFile
};
