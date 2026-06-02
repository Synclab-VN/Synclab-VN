const pagesByLocale = {
  vi: require("../../locales/pages/vi").terms,
  en: require("../../locales/pages/en").terms,
  ko: require("../../locales/pages/ko").terms
};
const { buildLegalPage } = require("./legal-page");

function buildTermsPage(locale) {
  return buildLegalPage(locale, pagesByLocale[locale.code]);
}

module.exports = {
  buildTermsPage
};
