const React = require('react');
const PropTypes = require('prop-types');
const IntegrationWizardStepOne = require('../../integration-wizard-step-one.jsx');
const ReactShallowRenderer = require('react-test-renderer/shallow');
const _ = require('lodash');

// todo: expand on this once we get better at testing react components
describe('<IntegrationWizardStepOne />', () => {
  let comp;

  beforeAll(() => {
    const renderer = new ReactShallowRenderer();
    renderer.render(<IntegrationWizardStepOne />);

    comp = renderer.getRenderOutput();
  });

  describe('render', () => {
    describe('wrapper', () => {
      it('has two children', () => {
        expect(comp.props.children.length).toBe(2);
      });

      it('is a div', () => {
        expect(comp.type).toBe('div');
      });

      describe('props', () => {
        const tests = {
          className: 'att-integration',
        };

        _.forEach(tests, (value, key) => {
          it(`${key} is correct`, () => {
            expect(comp.props[key]).toBe(value);
          });
        });
      });

      describe('first child:', () => {
        let child;

        beforeAll(() => {
          child = comp.props.children[0];
        });

        it('is an h2', () => {
          expect(child.type).toBe('h2');
        });

        it('has text', () => {
          expect(typeof child.props.children).toBe('string');
        });

        describe('props', () => {
          const tests = {
            className: 'att-integration__heading',
          };

          _.forEach(tests, (value, key) => {
            it(`${key} is correct`, () => {
              expect(child.props[key]).toBe(value);
            });
          });
        });
      });

      describe('second child:', () => {
        let child;

        beforeAll(() => {
          child = comp.props.children[1];
        });
        it('has two children', () => {
          expect(child.props.children.length).toBe(2);
        });

        it('is an article', () => {
          expect(child.type).toBe('article');
        });

        describe('props', () => {
          const tests = {
            className: 'att-integration__article',
          };

          _.forEach(tests, (value, key) => {
            it(`${key} is correct`, () => {
              expect(child.props[key]).toBe(value);
            });
          });
        });

        describe('first child:', () => {
          let child1;

          beforeAll(() => {
            child1 = child.props.children[0];
          });

          it('has one child', () => {
            expect(_.isPlainObject(child1.props.children)).toBe(true);
          });

          it('is a div', () => {
            expect(child1.type).toBe('div');
          });

          describe('props', () => {
            const tests = {
              className: 'att-integration__article__image',
            };

            _.forEach(tests, (value, key) => {
              it(`${key} is correct`, () => {
                expect(child1.props[key]).toBe(value);
              });
            });
          });

          describe('first child:', () => {
            let child2;

            beforeAll(() => {
              child2 = child1.props.children;
            });

            it('is an img', () => {
              expect(child2.type).toBe('img');
            });

            describe('props', () => {
              const tests = {
                className: 'att-integration__article__image__rtc-logo',
                alt: 'IBM Rational Policy Tester Logo',
                src: '../../img/ibm-rtc-logo-2x.png',
              };

              _.forEach(tests, (value, key) => {
                it(`${key} is correct`, () => {
                  expect(child2.props[key]).toBe(value);
                });
              });
            });
          });
        });

        describe('second child:', () => {
          let child1;

          beforeAll(() => {
            child1 = child.props.children[1];
          });

          it('has three children', () => {
            expect(child1.props.children.length).toBe(3);
          });

          it('is a div', () => {
            expect(child1.type).toBe('div');
          });

          describe('props', () => {
            const tests = {
              className: 'att-integration__article__text',
            };

            _.forEach(tests, (value, key) => {
              it(`${key} is correct`, () => {
                expect(child1.props[key]).toBe(value);
              });
            });
          });
        });
      });
    });
  });

  describe('propTypes', () => {
    const propTypes = {
      data: PropTypes.shape({
        tool: PropTypes.string,
      }),
    };

    _.forEach(propTypes, (value, key) => {
      it(`\`${key}\` is set properly`, () => {
        if (typeof propTypes[key] === 'function') {
          expect(PropTypes.checkPropTypes(IntegrationWizardStepOne.propTypes[key]))
            .toEqual(PropTypes.checkPropTypes(value));
        } else {
          expect(IntegrationWizardStepOne.propTypes[key])
            .toEqual(value);
        }
      });
    });
  });

  describe('defaultProps', () => {
    const defaultProps = {
      data: {
        type: 'RTC',
      },
    };

    _.forEach(defaultProps, (value, key) => {
      it(`\`${key}\` is set properly`, () => {
        expect(IntegrationWizardStepOne.defaultProps[key])
          .toEqual(value);
      });
    });
  });
});
