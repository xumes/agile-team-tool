var _          = require('underscore');
var moment     = require('moment');

module.exports = {
   stringToUtcDate: function(string){
    if(_.isEmpty(string)||!moment(string).isValid())
      return undefined;
    if(string.indexOf('UTC') > 0)
      return new Date(moment.utc(string).format());
    else if(string.indexOf('EST') > 0 || string.indexOf('EDT') > 0)
      return new Date(moment(string).utc().format());
    else if(string.indexOf('adm') > 0) //convert to utc for this case
      return new Date(moment(string).utc().format());
    else if(string.indexOf('UTC') < 0 && string.indexOf('EST') < 0 && string.indexOf('EDT') < 0) //homer said assume UTC
      return moment.utc(string).format() === 'Invalid date' ? undefined : new Date(moment.utc(string).format());
  }
};