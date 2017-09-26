const React = require('react');
const HomeTeamIntegration = require('../../team-integration-wizard.jsx');
const ReactShallowRenderer = require('react-test-renderer/shallow');
const _ = require('lodash');

// todo: expand on this once we get better at testing react components
describe('<HomeTeamIntegration />', () => {
  let comp;

  beforeAll(() => {
    const renderer = new ReactShallowRenderer();
    renderer.render(<HomeTeamIntegration />);

    comp = renderer.getRenderOutput();
  });

  describe('Class', () => {
    beforeAll(() => {
      this.hti = new HomeTeamIntegration();
    });

    afterAll(() => {
      this.hti = null;
      delete this.hti;
    });

    describe('State', () => {
      it('is defined', () => {
        expect(this.hti.state).toBeDefined();
      });

      it('is an object', () => {
        expect(_.isPlainObject(this.hti.state)).toBe(true);
      });

      describe('properties of state', () => {
        const test = {
          showModal: false,
        };

        _.forEach(test, (value, key) => {
          describe(`${key}`, () => {
            it('is expected value', () => {
              expect(this.hti.state[key]).toBe(value);
            });
          });
        });
      });
    });

    describe('Methods', () => {
      describe('show', () => {
        it('is defined', () => {
          expect(this.hti.show).toBeDefined();
        });

        it('is a function', () => {
          expect(typeof this.hti.show).toBe('function');
        });

        it('calls this.setState', () => {
          const spy = spyOn(this.hti, 'setState');
          this.hti.show();
          expect(spy).toHaveBeenCalledWith({
            showModal: true,
          });
        });
      });

      describe('hide', () => {
        it('is defined', () => {
          expect(this.hti.hide).toBeDefined();
        });

        it('is a function', () => {
          expect(typeof this.hti.hide).toBe('function');
        });

        it('calls this.setState', () => {
          const spy = spyOn(this.hti, 'setState');
          this.hti.hide();
          expect(spy).toHaveBeenCalledWith({
            showModal: false,
          });
        });
      });

      describe('render', () => {
        it('is defined', () => {
          expect(this.hti.render).toBeDefined();
        });

        it('is a function', () => {
          expect(typeof this.hti.render).toBe('function');
        });
      });
    });
  });

  describe('Render', () => {
    describe('wrapper', () => {
      it('has two children', () => {
        expect(comp.props.children.length).toBe(2);
      });

      it('is a div', () => {
        expect(comp.type).toBe('div');
      });

      describe('props', () => {
        const tests = {
          className: 'att-hti',
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

        it('has one child', () => {
          expect(
            _.isObject(child.props.children) &&
            !_.isArray(child.props.children),
          ).toBe(true);
        });

        it('is a div', () => {
          expect(child.type).toBe('div');
        });

        describe('props', () => {
          const tests = {
            className: 'home-team-header-teamname-btn',
            id: 'homeHeaderIntegrationBtn',
            role: 'button',
            tabIndex: '0',
          };

          _.forEach(tests, (value, key) => {
            it(`${key} is correct`, () => {
              expect(child.props[key]).toEqual(value);
            });
          });

          it('onClick is correct', () => {
            expect(typeof child.props.onClick).toBe('function');
          });
        });

        describe('first child:', () => {
          let child2;

          beforeAll(() => {
            child2 = comp.props.children[0].props.children;
          });

          it('has no child', () => {
            expect(child2.props.children).toBeUndefined();
          });

          describe('props', () => {
            const tests = {
              title: 'Configure Agile Tool Integration',
              class: 'home-team-header-teamname-btn-img',
              element: 'i',
            };

            _.forEach(tests, (value, key) => {
              it(`${key} is correct`, () => {
                expect(child2.props[key]).toEqual(value);
              });
            });

            it('src is a string', () => {
              expect(typeof child2.props.src).toBe('string');
            });
          });
        });
      });

      describe('second child:', () => {
        let child;

        beforeAll(() => {
          child = comp.props.children[1];
        });

        it('has children', () => {
          expect(child.props.children).toBeDefined();
        });

        describe('props', () => {
          const tests = {
            heading: 'Integration',
            show: false,
            backdropClassName: 'att-common-modal__backdrop',
            className: 'att-common-modal',
          };

          _.forEach(tests, (value, key) => {
            it(`${key} is correct`, () => {
              expect(child.props[key]).toBe(value);
            });
          });
        });
      });
    });
  });
});
