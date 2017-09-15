const CommonModal = require('../../common-modal.jsx');
const TestUtils = require('react-dom/test-utils');
const Modal = require('react-overlays').Modal;
const PropTypes = require('prop-types');

// todo: expand on this once we get better at testing react components
describe('CommonModal', () => {
  let props;
  let mountedModal;
  const modal = () => {
    if (!mountedModal) {
      mountedModal = TestUtils.renderIntoDocument(CommonModal(props));
    }
    return mountedModal;
  };

  beforeEach(() => {
    props = {
      foo: 'foo',
      bar: 'bar',
    };
    mountedModal = undefined;
  });

  it('is defined', () => {
    expect(CommonModal).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof CommonModal).toBe('function');
  });

  describe('composite', () => {
    it('is a composite', () => {
      const test = modal();
      expect(TestUtils.isCompositeComponent(test)).toBe(true);
    });

    it('composite of `Modal`', () => {
      const test = modal();
      expect(TestUtils.isCompositeComponentWithType(test, Modal)).toBe(true);
    });
  });

  describe('Properties', () => {
    describe('foo', () => {
      it('is defined', () => {
        const test = modal();
        expect(test.props.foo).toBeDefined();
      });

      it('is the value passed to it', () => {
        const test = modal();
        expect(test.props.foo).toBe(props.foo);
      });
    });

    describe('foo', () => {
      it('is defined', () => {
        const test = modal();
        expect(test.props.foo).toBeDefined();
      });

      it('is the value passed to it', () => {
        const test = modal();
        expect(test.props.foo).toBe(props.foo);
      });
    });

    describe('aria-labelledby', () => {
      it('is defined', () => {
        const test = modal();
        expect(test.props['aria-labelledby']).toBeDefined();
      });

      it('is a string', () => {
        const test = modal();
        expect(typeof test.props['aria-labelledby']).toBe('string');
      });
    });
  });

  describe('Removed Properties', () => {
    beforeEach(() => {
      props = {
        heading: 'heading',
        foo: 'bar',
      };
    });

    describe('heading', () => {
      it('is not defined', () => {
        const test = modal();
        expect(test.props.heading).not.toBeDefined();
      });
    });
  });

  describe('propTypes', () => {
    const propTypes = {
      children: PropTypes.node,
      heading: PropTypes.string,
      backdropClassName: PropTypes.string,
      className: PropTypes.string,
    };

    Object.keys(propTypes).forEach((key) => {
      it(`\`${key}\` is set properly`, () => {
        expect(CommonModal.propTypes[key]).toEqual(propTypes[key]);
      });
    });
  });

  describe('defaultProps', () => {
    const defaultProps = {
      children: undefined,
      heading: '',
      backdropClassName: 'att-common-modal__backdrop',
      className: 'att-common-modal',
    };

    Object.keys(defaultProps).forEach((key) => {
      it(`\`${key}\` is set properly`, () => {
        expect(CommonModal.defaultProps[key]).toEqual(defaultProps[key]);
      });
    });
  });
});
