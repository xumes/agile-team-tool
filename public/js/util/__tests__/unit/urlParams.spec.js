/* eslint no-console: */
/* global window */
const urlParams = require('../../urlParams');

describe('urlParams', () => {
  it('is defined', () => {
    expect(urlParams).toBeDefined();
  });

  describe('methods', () => {
    describe('get', () => {
      beforeAll(() => {
        window.history.pushState('', '', '?cc=us&lc=en');
      });

      afterAll(() => {
        window.history.pushState('', '', '/');
      });

      it('is defined', () => {
        expect(urlParams.get).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof urlParams.get).toBe('function');
      });

      it('returns the query value', () => {
        expect(urlParams.get('cc')).toBe('us');
        expect(urlParams.get('lc')).toBe('en');
      });
    });

    describe('getAll', () => {
      const result = {
        cc: 'fo',
        lc: 'ba',
      };

      beforeAll(() => {
        window.history.pushState('', '', '?cc=fo&lc=ba');
      });

      afterAll(() => {
        window.history.pushState('', '', '/');
      });

      it('is defined', () => {
        expect(urlParams.getAll).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof urlParams.getAll).toBe('function');
      });

      it('returns the query value', () => {
        expect(urlParams.getAll()).toEqual(result);
      });
    });
  });
});
