var _          = require('underscore');
var moment     = require('moment');
var moment = require('moment-timezone');
var allDocs = require('./data');
var ObjectId    = require('mongodb').ObjectID;


module.exports = {
  stringToUtcDate: function(string){
    if (_.isEmpty(string)||!moment(string).isValid() || typeof string != 'string' || string.indexOf('<head>') > -1){
      //console.log("invalid string " + string);
      return undefined;
    }
    else if (string.indexOf('UTC') > 0)
      return new Date(moment.utc(string).format());
    else if (string.indexOf('EST') > 0 || string.indexOf('EDT') > 0){
      //console.log(string + " -------- " + new Date(moment(string).utc().format()));
      return new Date(moment(string).utc().format());
    }
    else if (string.indexOf('SGT') > 0){
      return new Date(moment.tz(string, 'Asia/Singapore').utc().format());
      //console.log(string + " -------- " + new Date(newString))
    }
    else if (string.indexOf('adm') > 0) //convert to utc for this case
      return new Date(moment(string).utc().format());
    else if (string.indexOf('UTC') < 0 && string.indexOf('EST') < 0 && string.indexOf('EDT') < 0){ //homer said assume UTC
      //console.log("warning: not UTC, ETC/EDT, SGT, adm: " + string +". will try to set to: " + new Date(moment.utc(string).format()));
      return moment.utc(string).format() === 'Invalid date' ? undefined : new Date(moment.utc(string).format());
    }
  },

  getUserMap: function(){

    var map = {};

    var cloudantTeams = _.filter(allDocs.rows, function(row){ return row.doc.type === 'team'; });
    var cloudantTeams = _.pluck(cloudantTeams, 'doc');

    _.each(cloudantTeams, function(team) {

      _.each(team.members, function(person) {

        if (_.isEmpty(person.id))
          return;

        if ( _.isEmpty(map[(person.id).toLowerCase()]) ) {
          var mapVal = {};

          mapVal['userId'] = (person.key).toUpperCase();
          mapVal['name'] =  person.name;
          mapVal['email'] = (person.id).toLowerCase();

          map[(person.id).toLowerCase()] = mapVal;
        }
        else {
        //  console.log(person.id + " already in the map ");
        }
      });
    });
    return map;
  },

  getUserId: function(map, emailId){

    if (_.isEmpty(emailId))
      return undefined;

    emailId = emailId.toLowerCase();

    if (_.isEmpty(map[emailId])){
      if (emailId!=='batch')
        console.log('user not found, will insert their email as a userId: ' + emailId);
      return emailId;
    }
    else {
      if (_.isEmpty(map[emailId].userId)) console.log('userId in user map was empty:  '+emailId);
      return (_.isEmpty(map[emailId].userId)) ? emailId : map[emailId].userId;
    }
  },
  getUserName: function(map, emailId){

    if (_.isEmpty(emailId))
      return undefined;

    emailId = emailId.toLowerCase();

    if (_.isEmpty(map[emailId])){
      if (emailId!=='batch')
        console.log('user not found, will insert their email as a userId: ' + emailId);
      return emailId;
    }
    else {
      if (_.isEmpty(map[emailId].name)) console.log('name in user map was empty:  '+emailId);
      return (_.isEmpty(map[emailId].name)) ? emailId : map[emailId].name;
    }
  },

  lowerCase: function(string){
    return (_.isEmpty(string)) ? undefined : string.toLowerCase();
  }

};
