const pagesByLocale = {
  vi: require("../../locales/pages/vi").privacyPolicy,
  en: require("../../locales/pages/en").privacyPolicy,
  ko: require("../../locales/pages/ko").privacyPolicy
};
const { buildLegalPage } = require("./legal-page");

function buildPrivacyPolicyPage(locale) {
  return buildLegalPage(locale, pagesByLocale[locale.code]);
}

module.exports = {
  buildPrivacyPolicyPage
};
