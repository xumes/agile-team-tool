/* global window */
const urlParams = require('./urlParams');

/**
 * Gets language from `navigator`. Can be overridden with `cc` and `lc`
 * query strings.
 *
 * @return {object} An object with the following properties, `cc` and `lc`
 *
 * @example
 * const getLanguage = require('../util/getLanguage.jsx');
 *
 * const lang = getLanguage();
 * // → { cc: 'us', lc: 'en' }
 *
 * @example
 * // URL -> 'http://www.acme.com/?cc=ca&lc=fr'
 * const getLanguage = require('../util/getLanguage.jsx');
 *
 * const lang = getLanguage();
 * // → { cc: 'ca', lc: 'fr' }
 *
 */
const getLanguage = () => {
  const language = (
    window.navigator.userLanguage ||
    window.navigator.language
  ).toLowerCase();

  let lang = null;

  if (language.indexOf('-') > -1) {
    const split = language.split('-');
    lang = {
      lc: urlParams.get('lc') || split[0],
      cc: urlParams.get('cc') || split[1],
    };
  } else {
    lang = {
      lc: urlParams.get('lc') || language,
      cc: urlParams.get('cc') || null,
    };
  }

  return lang;
};

module.exports = getLanguage;
