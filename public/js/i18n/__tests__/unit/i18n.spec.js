/* global window */
import _ from 'lodash';
import axios from 'axios';
import * as ReactHtmlParser from 'react-html-parser';
import i18n from '../../i18n';
import enUs from '../../../../translations/en-us.json';
import consoleToggle from '../../../util/consoleToggle';
import * as parseHTML from '../../../util/parseHTML';

describe('i18n Instance', () => {
  beforeAll(() => {
    consoleToggle.disable();
    window.history.pushState('', '', '?cc=us&lc=en');
  });

  afterAll(() => {
    consoleToggle.enable();
    window.history.pushState('', '', '/');
  });

  it('is defined', () => {
    expect(i18n).toBeDefined();
  });

  describe('Properties', () => {
    describe('userLang', () => {
      it('is defined', () => {
        expect(i18n.userLang).toBeDefined();
      });

      it('is set as expected', () => {
        expect(i18n.userLang).toBe('en-us');
      });

      it('can be assigned a value', () => {
        // setup
        const val = i18n.userLang;
        const newVal = 'foobar';

        i18n.userLang = newVal;

        // test
        expect(i18n.userLang).toBe(newVal);

        // teardown
        i18n.userLang = val;
      });

      describe('languages', () => {
        it('is defined', () => {
          expect(i18n.languages).toBeDefined();
        });

        it('is a plain object', () => {
          expect(_.isPlainObject(i18n.languages)).toBe(true);
        });

        it('is initialized with a default', () => {
          expect(Object.keys(i18n.languages).length).toBe(1);
        });

        it('default language is `en-us`', () => {
          expect(i18n.languages['en-us']).toBeDefined();
        });

        it('default language is a plain object', () => {
          expect(_.isPlainObject(i18n.languages)).toBe(true);
        });

        it('default language is equal to `en-us` json file', () => {
          expect(i18n.languages['en-us']).toEqual(enUs);
        });

        it('is immutable', () => {
          expect(() => {
            i18n.languages = 'foobar';
          }).toThrowError();
        });
      });

      describe('data', () => {
        it('is defined', () => {
          expect(i18n.data).toBeDefined();
        });

        it('is a plain object', () => {
          expect(_.isPlainObject(i18n.data)).toBe(true);
        });

        it('is set to `this.languages[this.userLang]`', () => {
          expect(i18n.data).toEqual(i18n.languages[i18n.userLang]);
        });

        it('is immutable', () => {
          expect(() => {
            i18n.data = 'foobar';
          }).toThrowError();
        });
      });

      describe('fallback', () => {
        it('is defined', () => {
          expect(i18n.fallback).toBeDefined();
        });

        it('is a plain object', () => {
          expect(_.isPlainObject(i18n.fallback)).toBe(true);
        });

        it('is equal to `en-us` json file', () => {
          expect(i18n.fallback).toEqual(enUs);
        });

        it('is immutable', () => {
          expect(() => {
            i18n.fallback = 'foobar';
          }).toThrowError();
        });
      });
    });
  });

  describe('Methods', () => {
    describe('initialize', () => {
      it('is defined', () => {
        expect(i18n.initialize).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof i18n.initialize).toBe('function');
      });

      it('calls `this.fetch`', () => {
        spyOn(i18n, 'fetch');
        i18n.initialize();
        expect(i18n.fetch).toHaveBeenCalled();
      });

      it('with `this.userLang`', () => {
        spyOn(i18n, 'fetch');
        i18n.initialize();
        expect(i18n.fetch).toHaveBeenCalledWith(i18n.userLang);
      });

      it('returns a promise', () => {
        expect(i18n.initialize() instanceof Promise).toBe(true);
      });

      it('resolves with `this.fetch` response', (done) => {
        const test = 'foobar';
        spyOn(i18n, 'fetch').and.returnValue(test);

        i18n.initialize()
          .then((re) => {
            expect(re).toBe(test);
            done();
          });
      });
    });

    describe('fetch', () => {
      it('is defined', () => {
        expect(i18n.fetch).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof i18n.fetch).toBe('function');
      });

      describe('Language already exists', () => {
        it('*NO* axios call is made', () => {
          spyOn(axios, 'get');
          i18n.fetch('en-us');
          expect(axios.get).not.toHaveBeenCalled();
        });

        it('returns the language object', (done) => {
          i18n.fetch('en-us')
            .then((re) => {
              expect(re).toEqual(enUs);
              done();
            });
        });
      });

      describe('Language *does not* exist', () => {
        it('calls `axios.get`', () => {
          spyOn(axios, 'get');
          i18n.fetch('fo-ba');
          expect(axios.get).toHaveBeenCalled();
        });

        it('...with expected path', () => {
          const lang = 'fo-ba';
          spyOn(axios, 'get');
          i18n.fetch(lang);
          expect(axios.get).toHaveBeenCalledWith(`./translations/${lang}.json`);
        });

        describe('Success', () => {
          const lcCc = 'fo-ba';
          const response = {
            data: {
              common: {
                foo: 'foobar',
              },
            },
          };
          let dfr;

          beforeAll(() => {
            spyOn(axios, 'get').and.returnValue(response);
            dfr = i18n.fetch(lcCc);
          });

          afterAll(() => {
            i18n.userLang = 'en-us';
            i18n.removeLanguage(lcCc);
          });

          it('updates i18n.userLang', (done) => {
            dfr
              .then(() => {
                expect(i18n.userLang).toBe(lcCc);
                done();
              });
          });

          it('adds language to i18n.languages', (done) => {
            dfr
              .then(() => {
                expect(i18n.languages[lcCc]).toEqual(response.data);
                done();
              });
          });
        });

        describe('Failure', () => {
          const lang = 'fo-ba';
          let dfr;

          beforeAll(() => {
            spyOn(axios, 'get').and.throwError();
            dfr = i18n.fetch(lang);
          });

          it('*does not* update i18n.userLang', (done) => {
            dfr
              .then(() => {
                expect(i18n.userLang).toBe('en-us');
                done();
              });
          });

          it('*does not* addslanguage to i18n.languages', (done) => {
            dfr
              .then(() => {
                expect(i18n.languages[lang]).not.toBeDefined();
                done();
              });
          });
        });
      });
    });

    describe('t', () => {
      it('is defined', () => {
        expect(i18n.t).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof i18n.t).toBe('function');
      });

      describe('No arguments', () => {
        it('returns `null`', () => {
          expect(i18n.t()).toBeNull();
        });
      });

      describe('Path exists in i18n.data', () => {
        it('returns the value', () => {
          const path = 'common.cancel';
          const test = i18n.t(path);
          expect(test).toBe(_.get(enUs, path));
        });
      });

      describe('*NO* path exists in i18n.data', () => {
        describe('Path exists in i18n.fallback', () => {
          const response = {
            data: {
              common: {
                foo: 'foobar',
              },
            },
          };
          let dfr;

          beforeAll(() => {
            spyOn(axios, 'get').and.returnValue(response);
            dfr = i18n.fetch('fo-ba');
          });

          afterAll(() => {
            i18n.userLang = 'en-us';
            i18n.removeLanguage('fo-ba');
          });

          it('returns the value', (done) => {
            dfr
              .then(() => {
                const path = 'common.cancel';
                const test = i18n.t(path);
                expect(test).toBe(_.get(enUs, path));
                done();
              });
          });
        });

        describe('*NO* path exists in i18n.fallback', () => {
          const response = {
            data: {
              common: {
                foo: 'foobar',
              },
            },
          };
          let dfr;

          beforeAll(() => {
            spyOn(axios, 'get').and.returnValue(response);
            dfr = i18n.fetch('fo-ba');
          });

          afterAll(() => {
            i18n.userLang = 'en-us';
            i18n.removeLanguage('fo-ba');
          });

          it('returns the value', (done) => {
            dfr
              .then(() => {
                const path = 'common.bar';
                const test = i18n.t(path);
                expect(test).toBeNull();
                done();
              });
          });
        });
      });
    });

    describe('parseHTML', () => {
      it('is defined', () => {
        expect(i18n.parseHTML).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof i18n.parseHTML).toBe('function');
      });

      describe('i18n.t', () => {
        beforeAll(() => {
          spyOn(i18n, 't');
          i18n.parseHTML('common.cancel');
        });

        it('is called', () => {
          expect(i18n.t).toHaveBeenCalled();
        });

        it('first argument is as expected', () => {
          expect(i18n.t.calls.argsFor(0)[0]).toBe('common.cancel');
        });

        it('second argument is as expected', () => {
          expect(i18n.t.calls.argsFor(0)[1]).toBe('html');
        });
      });

      describe('Passed invalid path', () => {
        it('returns `null`', () => {
          expect(i18n.parseHTML('foo.bar')).toBeNull();
        });
      });

      describe('Passed valid path', () => {
        const path = 'foo.bar';
        const context = 'foo';
        const val = 'hello';
        const result = [1, 2, 3];
        let test;

        beforeAll(() => {
          spyOn(parseHTML, 'default').and.returnValue(result);
          spyOn(i18n, 't').and.returnValue(val);
          test = i18n.parseHTML(path, context);
        });

        it('calls `parseHTML` utility', () => {
          expect(parseHTML.default).toHaveBeenCalled();
        });

        it('first argument is as expected', () => {
          expect(parseHTML.default.calls.argsFor(0)[0]).toBe(val);
        });

        it('second argument is as expected', () => {
          expect(parseHTML.default.calls.argsFor(0)[1]).toBe(context);
        });

        it('returns the result of the utility', () => {
          expect(test).toBe(result);
        });
      });
    });

    describe('parseReact', () => {
      it('is defined', () => {
        expect(i18n.parseReact).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof i18n.parseReact).toBe('function');
      });

      describe('i18n.t', () => {
        beforeAll(() => {
          spyOn(i18n, 't');
          i18n.parseReact('common.cancel');
        });

        it('is called', () => {
          expect(i18n.t).toHaveBeenCalled();
        });

        it('first argument is as expected', () => {
          expect(i18n.t.calls.argsFor(0)[0]).toBe('common.cancel');
        });

        it('second argument is as expected', () => {
          expect(i18n.t.calls.argsFor(0)[1]).toBe('react');
        });
      });

      describe('Passed invalid path', () => {
        it('returns `null`', () => {
          expect(i18n.parseReact('foo.bar')).toBeNull();
        });
      });

      describe('Passed valid path', () => {
        const path = 'foo.bar';
        const context = 'foo';
        const val = 'hello';
        const result = [1, 2, 3];
        let test;

        beforeAll(() => {
          spyOn(ReactHtmlParser, 'default').and.returnValue(result);
          spyOn(i18n, 't').and.returnValue(val);
          test = i18n.parseReact(path, context);
        });

        it('calls `parseReact` utility', () => {
          expect(ReactHtmlParser.default).toHaveBeenCalled();
        });

        it('first argument is as expected', () => {
          expect(ReactHtmlParser.default.calls.argsFor(0)[0]).toBe(val);
        });

        it('returns the result of the utility', () => {
          expect(test).toBe(result);
        });
      });
    });

    describe('removeLanguage', () => {
      it('is defined', () => {
        expect(i18n.removeLanguage).toBeDefined();
      });

      it('is a function', () => {
        expect(typeof i18n.removeLanguage).toBe('function');
      });

      describe('Passed nothing', () => {
        it('returns `null`', () => {
          expect(i18n.removeLanguage()).toBeNull();
        });
      });

      describe('Passed invalid lang', () => {
        it('returns `null`', () => {
          expect(i18n.removeLanguage('fo-ba')).toBeNull();
        });
      });

      describe('Passed this.userLang', () => {
        const response = {
          data: {
            common: {
              foo: 'foobar',
            },
          },
        };
        let dfr;

        beforeAll(() => {
          spyOn(axios, 'get').and.returnValue(response);
          dfr = i18n.fetch('fo-ba');
        });

        afterAll(() => {
          i18n.userLang = 'en-us';
          i18n.removeLanguage('fo-ba');
        });

        it('returns `null`', (done) => {
          dfr
            .then(() => {
              expect(i18n.removeLanguage('fo-ba')).toBeNull();
              done();
            });
        });
      });

      describe('Passed fallback lang', () => {
        const response = {
          data: {
            common: {
              foo: 'foobar',
            },
          },
        };
        let dfr;

        beforeAll(() => {
          spyOn(axios, 'get').and.returnValue(response);
          dfr = i18n.fetch('fo-ba');
        });

        afterAll(() => {
          i18n.userLang = 'en-us';
          i18n.removeLanguage('fo-ba');
        });

        it('returns `null`', (done) => {
          dfr
            .then(() => {
              expect(i18n.removeLanguage('en-us')).toBeNull();
              done();
            });
        });
      });

      describe('Passed valid lang', () => {
        const response = {
          data: {
            common: {
              foo: 'foobar',
            },
          },
        };
        let dfr;

        beforeAll(() => {
          spyOn(axios, 'get').and.returnValue(response);
          dfr = i18n.fetch('fo-ba');
        });

        afterAll(() => {
          i18n.userLang = 'en-us';
          i18n.removeLanguage('fo-ba');
        });

        it('returns the removed language', (done) => {
          dfr
            .then(() => {
              i18n.userLang = 'en-us';
              expect(
                i18n.removeLanguage('fo-ba'),
              ).toEqual(
                { 'fo-ba': response.data },
              );
              done();
            });
        });
      });
    });
  });
});
