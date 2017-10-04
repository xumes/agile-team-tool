/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

import axios from 'axios';
import ReactHtmlParser from 'react-html-parser';
import _ from 'lodash';
import getLanguage from '../util/getLanguage';
import urlParams from '../util/urlParams';
import parseHTML from '../util/parseHTML';
import enUs from '../../translations/en-us.json';

const FALLBACK = 'en-us';
const languages = {
  'en-us': enUs,
};

class I18n {
  constructor() {
    const userLang = getLanguage();
    this.userLang = `${userLang.lc}-${userLang.cc}`;

    Object.defineProperty(this, 'languages', {
      get: () => languages,
    });

    Object.defineProperty(this, 'data', {
      enumerable: true,
      get: () => this.languages[this.userLang],
    });

    Object.defineProperty(this, 'fallback', {
      enumerable: true,
      get: () => languages[FALLBACK],
    });
  }

  async initialize() {
    return this.fetch(this.userLang);
  }

  async fetch(lcCc, forceFetch) {
    let isFetched = true;
    let json = null;

    if (this.languages[`${lcCc}`] && !forceFetch) {
      json = this.languages[`${lcCc}`];
    } else {
      try {
        json = await axios.get(`./translations/${lcCc}.json`);
        this.languages[`${lcCc}`] = json.data;
      } catch (error) {
        isFetched = false;
        console.error(`Unable to fetch i18n data for \`${lcCc}\`.`, error);
      }
    }

    if (isFetched) {
      this.userLang = lcCc;
    }

    return json;
  }

  t(path = '', context) {
    const newPath = path.replace(/^i18n.data./, '');
    const langCopy = _.get(this.data, newPath);
    let copy = null;

    if (langCopy) {
      copy = langCopy;
    } else {
      const fallbackCopy = _.get(this.fallback, newPath);

      console.info(`No translation exists for path, \`${newPath}\`, and language, \`${this.userLang}\`. Attempting fallback...`);

      if (fallbackCopy) {
        copy = fallbackCopy;
      } else {
        console.info(`Fallback translation for path, \`${newPath}\`, failed.`);
      }
    }

    /**
     * Handle highlighting
     */
    if (copy && urlParams.get('i18n') === 'highlight') {
      copy = `<span class="i18n-highlight">${copy}</span>`;

      if (!context) {
        // assume React parser, for now.
        copy = ReactHtmlParser(copy);
      }
    }

    return copy;
  }

  parseHTML(path, context) {
    const elem = this.t(path, 'html');
    let val = null;

    if (elem) {
      val = parseHTML(elem, context);
    }

    return val;
  }

  parseReact(path) {
    const elem = this.t(path, 'react');
    let val = null;

    if (elem) {
      val = ReactHtmlParser(elem);
    }

    return val;
  }

  removeLanguage(lcCc = '') {
    let val = null;

    if (languages[lcCc]) {
      switch (lcCc) {
        case this.userLang: {
          console.info(`Cannot remove language \`${lcCc}\`. It is currently loaded.`);
          break;
        }
        case FALLBACK: {
          console.info(`Cannot remove language \`${lcCc}\`. It is the fallback.`);
          break;
        }
        default: {
          val = _.pick(languages, lcCc);
          delete languages[lcCc];
        }
      }
    }

    return val;
  }
}

const i18n = new I18n();

export default i18n;
