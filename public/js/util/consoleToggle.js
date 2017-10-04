/* eslint no-console: */
const _ = require('lodash');

const keys = [
  'log',
  'info',
  'warn',
  'error',
  'group',
  'groupCollapsed',
  'groupEnd',
];

const origs = _.fromPairs(
  _.map(keys, key => [key, console[key]]),
);


module.exports = {
  /**
   * Enables console methods
   * @name enable()
   */
  enable() {
    _.forEach(keys, (key) => {
      console[key] = origs[key];
    });
  },

  /**
   * Disables console methods
   * @name disable()
   */
  disable() {
    _.forEach(keys, (key) => {
      console[key] = () => {};
    });
  },
};
