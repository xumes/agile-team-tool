const uniqueID = require('../../uniqueID.js');

describe('Utility: uniqueID', () => {
  it('is defined', () => {
    expect(uniqueID).toBeDefined();
  });

  it('is a function', () => {
    expect(typeof uniqueID).toBe('function');
  });

  it('can be run without error', () => {
    expect(() => {
      uniqueID();
    }).not.toThrow();
  });

  it('returns a string', () => {
    const test = uniqueID();
    expect(typeof test).toBe('string');
  });

  it('string has two main parts', () => {
    expect(uniqueID().split('-').length).toBe(2);
  });

  it('first part is a timestamp', () => {
    // setup
    jasmine.clock().install();
    const change = 1000;
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);

    // first
    let test = uniqueID().split('-')[0];
    expect(test).toEqual((baseTime.getTime()).toString());

    // second
    jasmine.clock().tick(change);
    test = uniqueID().split('-')[0];
    expect(test).toEqual((baseTime.getTime() + change).toString());

    // teardown
    jasmine.clock().uninstall();
  });

  it('second part is a count', () => {
    const initial = parseFloat(uniqueID().split('-')[1]);
    const test = parseFloat(uniqueID().split('-')[1]);

    expect(test).toBe(initial + 1);
  });
});
