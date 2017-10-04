const fs = require('fs');
const _  = require('lodash');
const en = require('../public/translations/en-us.json');

const mapLeaves = (obj, callback, prefix = '') => {
  const result = {};

  _.forEach(obj, (val, key) => {
    const address = prefix + (prefix.length > 0 ? '.' : '') + key;

    if (_.isPlainObject(val)) {
      result[key] = mapLeaves(val, callback, address);
    } else {
      result[key] = callback(val, address);
    }
  });

  return result;
};

const xX = (text) => {
  return _.map(text.split(''), (c) => {
    if (('abcdefghijklmnopqrstuvwxyz').indexOf(c) > -1) {
      return '🀰';
    } else if (('ABCDEFGHIJKLMNOPQRSTUVWXYZ').indexOf(c) > -1) {
      return '🁢';
    } else {
      return c;
    }
  }).join('');
};

(() => {
  const xx = mapLeaves(en, xX);
  const xx_json = JSON.stringify(xx, null, 2);

  fs.writeFile('./public/translations/xx-us.json', xx_json, () => {
    console.log('\x1b[32m%s\x1b[0m', 'Done translating!');
  });
})();
