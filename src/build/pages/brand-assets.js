const fs = require("fs");
const path = require("path");
const { paths, writeFile } = require("../context");

const faviconViewBox = {
  x: 0,
  y: 0,
  width: 164.57303,
  height: 164.57303
};

function readLogoPath() {
  const source = fs.readFileSync(path.join(paths.sourceAssetDir, "synclab-logo.svg"), "utf8");
  const pathMatch = source.match(/<path\b([\s\S]*?)\/?>/i);

  if (!pathMatch) {
    throw new Error("Could not find logo path in src/assets/synclab-logo.svg");
  }

  const attributes = pathMatch[1];
  const dMatch = attributes.match(/\sd="([^"]+)"/i);
  const styleMatch = attributes.match(/\sstyle="([^"]+)"/i);

  if (!dMatch) {
    throw new Error("Could not find logo path data in src/assets/synclab-logo.svg");
  }

  return {
    d: dMatch[1],
    style: styleMatch ? styleMatch[1] : "fill:#01e0fa;stroke:#fdfafa;stroke-width:2;stroke-linecap:round;paint-order:fill markers stroke"
  };
}

function renderFaviconSvg() {
  const logoPath = readLogoPath();
  const verticalOffset = ((faviconViewBox.height - 158.49815) / 2).toFixed(5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${faviconViewBox.x} ${faviconViewBox.y} ${faviconViewBox.width} ${faviconViewBox.height}" role="img" aria-labelledby="title">
  <title id="title">Synclab</title>
  <g transform="translate(0 ${verticalOffset})">
    <path style="${logoPath.style}" d="${logoPath.d}" />
  </g>
</svg>
`;
}

function copyBrandAsset(sourceName, outputName) {
  fs.copyFileSync(
    path.join(paths.sourceAssetDir, sourceName),
    path.join(paths.outputRoot, outputName)
  );
}

function buildBrandAssets() {
  writeFile(path.join(paths.outputRoot, "favicon.svg"), renderFaviconSvg());
  copyBrandAsset("favicon.ico", "favicon.ico");
  copyBrandAsset("apple-touch-icon.png", "apple-touch-icon.png");

  fs.mkdirSync(path.join(paths.outputAssetDir, "logo"), { recursive: true });
  fs.copyFileSync(
    path.join(paths.sourceAssetDir, "synclab-logo-seo.png"),
    path.join(paths.outputAssetDir, "logo", "synclab-logo.png")
  );

  return 4;
}

module.exports = {
  buildBrandAssets
};
