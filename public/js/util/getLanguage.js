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
  // navigator.languages:    Chrome & FF
  // navigator.language:     Safari & Others
  // navigator.userLanguage: IE & Others
  const nav = window.navigator;
  const langKeys = [
    'language',
    'browserLanguage',
    'systemLanguage',
    'userLanguage',
  ];
  let language;
  let result;

  /**
   * Get the Language
   */
  if (Array.isArray(nav.languages)) {
    language = nav.languages.filter(Boolean)[0];
  }

  if (!language) {
    language = langKeys
      .map(v => nav[v])
      .filter(Boolean)[0];
  }


  /**
   * Lowercase, fallback to empty string to avoid potential Error
   */
  language = (language || '').toLowerCase();


  /**
   * Process the Language and any overrides
   */
  if (language.indexOf('-') > -1) {
    const split = language.split('-');
    result = {
      lc: urlParams.get('lc') || split[0],
      cc: urlParams.get('cc') || split[1],
    };
  } else {
    result = {
      lc: urlParams.get('lc') || language || null,
      cc: urlParams.get('cc') || null,
    };
  }

  return result;
};

module.exports = getLanguage;
