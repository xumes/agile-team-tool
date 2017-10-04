/* eslint no-console: */
const consoleToggle = require('../../consoleToggle');

fdescribe('consoleToggle', () => {
  it('is defined', () => {
    expect(consoleToggle).toBeDefined();
  });

  describe('method: disable', () => {
    let spy;
    let spyInfo;
    let spyWarn;
    let spyError;
    let spyGroup;
    let spyGroupCollapsed;
    let spyGroupEnd;

    beforeAll(() => {
      spy = spyOn(console, 'log');
      spyInfo = spyOn(console, 'info');
      spyWarn = spyOn(console, 'warn');
      spyError = spyOn(console, 'error');
      spyGroup = spyOn(console, 'group');
      spyGroupCollapsed = spyOn(console, 'groupCollapsed');
      spyGroupEnd = spyOn(console, 'groupEnd');
      consoleToggle.disable();
    });

    afterAll(() => {
      consoleToggle.enable();
    });

    it('disables console.log', () => {
      console.log('foo');
      expect(spy).not.toHaveBeenCalled();
    });

    it('disables console.info', () => {
      console.info('foo');
      expect(spyInfo).not.toHaveBeenCalled();
    });

    it('disables console.warn', () => {
      console.warn('foo');
      expect(spyWarn).not.toHaveBeenCalled();
    });

    it('disables console.error', () => {
      console.error('foo');
      expect(spyError).not.toHaveBeenCalled();
    });

    it('disables console.group', () => {
      console.group('foo');
      expect(spyGroup).not.toHaveBeenCalled();
    });

    it('disables console.groupCollapsed', () => {
      console.groupCollapsed('foo');
      expect(spyGroupCollapsed).not.toHaveBeenCalled();
    });

    it('disables console.groupEnd', () => {
      console.groupEnd('foo');
      expect(spyGroupEnd).not.toHaveBeenCalled();
    });
  });

  describe('method: enable', () => {
    let spy;
    let spyInfo;
    let spyWarn;
    let spyError;
    let spyGroup;
    let spyGroupCollapsed;
    let spyGroupEnd;

    beforeAll(() => {
      consoleToggle.disable();
      consoleToggle.enable();
      spy = spyOn(console, 'log');
      spyInfo = spyOn(console, 'info');
      spyWarn = spyOn(console, 'warn');
      spyError = spyOn(console, 'error');
      spyGroup = spyOn(console, 'group');
      spyGroupCollapsed = spyOn(console, 'groupCollapsed');
      spyGroupEnd = spyOn(console, 'groupEnd');
    });

    it('enables the console.log', () => {
      console.log('bar');
      expect(spy).toHaveBeenCalledWith('bar');
    });

    it('enables the console.log', () => {
      console.info('bar');
      expect(spyInfo).toHaveBeenCalledWith('bar');
    });

    it('enables console.warn', () => {
      console.warn('foo');
      expect(spyWarn).toHaveBeenCalledWith('foo');
    });

    it('enables console.error', () => {
      console.error('foo');
      expect(spyError).toHaveBeenCalledWith('foo');
    });

    it('enables console.group', () => {
      console.group('foo');
      expect(spyGroup).toHaveBeenCalledWith('foo');
    });

    it('enables console.groupCollapsed', () => {
      console.groupCollapsed('foo');
      expect(spyGroupCollapsed).toHaveBeenCalledWith('foo');
    });

    it('enables console.groupEnd', () => {
      console.groupEnd('foo');
      expect(spyGroupEnd).toHaveBeenCalledWith('foo');
    });
  });
});
