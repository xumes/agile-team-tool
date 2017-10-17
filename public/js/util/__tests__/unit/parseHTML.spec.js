/* global DocumentFragment */
import parseHTML from '../../parseHTML';

describe('Utility: parseHTML', () => {
  const text = 'hello world';
  const html = 'hello <span>world</span>';

  it('is defined', () => {
    expect(parseHTML).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof parseHTML).toBe('function');
  });

  describe('Passed plain text', () => {
    beforeAll(() => {
      this.test = parseHTML(text);
    });

    afterAll(() => {
      this.test = null;
      delete this.test;
    });

    it('returns a DocumentFragment', () => {
      expect(this.test instanceof DocumentFragment).toBe(true);
    });

    it('has the expected textContent', () => {
      expect(this.test.textContent).toBe(text);
    });
  });

  describe('Passed html text', () => {
    beforeAll(() => {
      this.test = parseHTML(html);
    });

    afterAll(() => {
      this.test = null;
      delete this.test;
    });

    it('returns a DocumentFragment', () => {
      expect(this.test instanceof DocumentFragment).toBe(true);
    });

    it('has the expected textContent', () => {
      expect(this.test.textContent).toBe(text);
    });

    it('has the expected childNodes count', () => {
      expect(this.test.childNodes.length).toBe(2);
    });

    it('has the expected childElementCount', () => {
      expect(this.test.childElementCount).toBe(1);
    });

    describe('first node', () => {
      let first;

      beforeAll(() => {
        first = this.test.childNodes[0];
      });

      it('is a text node', () => {
        expect(first.nodeType).toBe(3);
      });

      it('has the expected textContent', () => {
        expect(first.textContent).toBe('hello ');
      });
    });

    describe('second node', () => {
      let second;

      beforeAll(() => {
        second = this.test.childNodes[1];
      });

      it('is an element node', () => {
        expect(second.nodeType).toBe(1);
      });

      it('is the expected element type', () => {
        expect(second.nodeName.toLowerCase()).toBe('span');
      });

      it('has the expected innerHTML', () => {
        expect(second.innerHTML).toBe('world');
      });
    });
  });
});
