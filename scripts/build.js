const { buildSite } = require("../src/build");

const result = buildSite();

console.log(`Generated ${result.generatedPages} pages, ${result.generatedStaticFiles} SEO files, and ${result.generatedBrandAssets} brand assets in docs/.`);
