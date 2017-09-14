// counter to guarantee uniqueness
let count = 0;

/**
 * Function to create a unique ID based on a timestamp. A counter is appended to the end of each
 * generated ID. This will all but guarantee true uniqueness of the ID.
 *
 * @return {string} A unique timestamp
 *
 * @example
 * const uniqueID = require('../util/uniqueID.jsx');
 *
 * const aria_id = uniqueID();
 * // → "1505358003471-1"
 *
 */
const uniqueID = () => {
  const timestamp = Date.now();
  count += 1;

  return `${timestamp}-${count}`;
};

module.exports = uniqueID;
