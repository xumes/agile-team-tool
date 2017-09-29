/* global window */
const getLanguage = require('../../getLanguage.js');
const _ = require('lodash');

fdescribe('Utility: getLanguage', () => {
  const language = (
    window.navigator.userLanguage ||
    window.navigator.language
  ).toLowerCase();

  it('is defined', () => {
    expect(getLanguage).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof getLanguage).toBe('function');
  });

  it('can be run without error', () => {
    expect(() => {
      getLanguage();
    }).not.toThrow();
  });

  it('returns an object', () => {
    const test = getLanguage();
    expect(_.isPlainObject(test)).toBe(true);
  });

  describe('Properties', () => {
    let lang;

    beforeAll(() => {
      lang = getLanguage();
    });

    describe('cc', () => {
      it('is defined', () => {
        expect(lang.cc).toBeDefined();
      });

      it('is a string', () => {
        expect(typeof lang.cc).toBe('string');
      });

      it('is set properly', () => {
        expect(lang.cc).toBe(language.split('-')[1]);
      });
    });

    describe('lc', () => {
      it('is defined', () => {
        expect(lang.lc).toBeDefined();
      });

      it('is a string', () => {
        expect(typeof lang.lc).toBe('string');
      });

      it('is set properly', () => {
        expect(lang.lc).toBe(language.split('-')[0]);
      });
    });
  });

  describe('Override', () => {
    let lang;
    const cc = 'ca';
    const lc = 'fr';

    beforeAll(() => {
      window.history.pushState('', '', `?cc=${cc}&lc=${lc}`);
      lang = getLanguage();
    });

    afterAll(() => {
      window.history.pushState('', '', '/');
    });

    describe('cc', () => {
      it('is set properly', () => {
        expect(lang.cc).toBe(cc);
      });
    });

    describe('lc', () => {
      it('is set properly', () => {
        expect(lang.lc).toBe(lc);
      });
    });
  });
});
