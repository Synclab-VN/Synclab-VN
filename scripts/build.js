const {
  cleanOutput,
  copyAssets,
  locales
} = require("../src/build/context");
const { buildIndexPage } = require("../src/build/pages/index");
const { buildPrivacyPolicyPage } = require("../src/build/pages/privacy-policy");
const { buildSupportPage } = require("../src/build/pages/support");
const { buildTermsPage } = require("../src/build/pages/terms");

const pageBuilders = [
  buildIndexPage,
  buildPrivacyPolicyPage,
  buildSupportPage,
  buildTermsPage
];

cleanOutput();
copyAssets();

let generatedPages = 0;

for (const locale of locales) {
  for (const buildPage of pageBuilders) {
    generatedPages += buildPage(locale);
  }
}

console.log(`Generated ${generatedPages} pages in docs/.`);
