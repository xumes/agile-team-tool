// counter to guarantee uniqueness
let count = 0;

/**
 * Function to create a unique ID. A counter is appended to the end of each
 * generated ID. This will all but guarantee true uniqueness of the ID.
 *
 * @param {integer} len The length of the ID (default is 5)
 * @param {string} chars The string of characters to use to generate the random ID (default A-Za-z)
 * @return {string} A random string based on parameters
 *
 * @example
 * const uniqueID = require('../util/uniqueID.jsx');
 * // Default usage
 * const aria_id = uniqueID();
 * // → "fAwfG-1"
 *
 * @example
 * const uniqueID = require('../util/uniqueID.jsx');
 * // Usage with parameters
 * const item_id = uniqueID(6,"1234567890abcdef.!$");
 * // → "5.fd!2-2"
 */
const uniqueID = (
  len = 5,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
) => {
  count += 1;

  const id = Array.apply(0, Array(len))
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');

  return `${id}-${count}`;
};

module.exports = uniqueID;
