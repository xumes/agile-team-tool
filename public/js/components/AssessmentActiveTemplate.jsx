// layout components renderer based on IBM v18
var Promise = require('bluebird');

// assessment page, render main twisty
module.exports.mainTwisty = function(twistyId, extraClass){
  var ul = document.createElement('ul');
  ul.setAttribute('class', 'ibm-twisty ' + extraClass);
  ul.setAttribute('id', twistyId);
  return ul;
};
