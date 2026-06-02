const pagesByLocale = {
  vi: require("../../locales/pages/vi").support,
  en: require("../../locales/pages/en").support,
  ko: require("../../locales/pages/ko").support
};
const { buildLegalPage } = require("./legal-page");

function buildSupportPage(locale) {
  return buildLegalPage(locale, pagesByLocale[locale.code]);
}

module.exports = {
  buildSupportPage
};
