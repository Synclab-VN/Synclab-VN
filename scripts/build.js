const {
  cleanOutput,
  copyAssets,
  locales
} = require("../src/build/context");
const { buildIndexPage } = require("../src/build/pages/index");
const { buildCompanyProfilePage } = require("../src/build/pages/company-profile");
const { buildPrivacyPolicyPage } = require("../src/build/pages/privacy-policy");
const { buildSupportPage } = require("../src/build/pages/support");
const { buildTermsPage } = require("../src/build/pages/terms");
const { buildStaticSeoFiles } = require("../src/build/pages/static-seo");

const pageBuilders = [
  buildIndexPage,
  buildCompanyProfilePage,
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

const generatedStaticFiles = buildStaticSeoFiles();

console.log(`Generated ${generatedPages} pages and ${generatedStaticFiles} SEO files in docs/.`);
