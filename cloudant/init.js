var logger   = require('../middleware/logger');
var cloudant = require('cloudant');

//TODO
module.exports.init = function(){
  logger.get('init').info("Checking Cloudant DB fixtures...");
  
}