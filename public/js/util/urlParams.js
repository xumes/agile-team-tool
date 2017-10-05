/* global location */
const _ = require('lodash');

// TODO: Unit test this dealio
const urlParams = () => _.fromPairs(_.compact(_.map(
  location.search.slice(1).split('&'),
  (item) => {
    if (item) {
      return item.split('=');
    }

    return false;
  },
)));

module.exports = {
  get: (key) => {
    const kvs = urlParams();

    return kvs[key];
  },

  getAll: () => urlParams(),
};
