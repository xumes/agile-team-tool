var https = require('https');
var Promise = require('bluebird');
var settings = require('../settings');
var _ = require('underscore');
var request = require('request');
var msg = {
  'statusCode':0,
  'message':null
};

function getGpsCoordinate(location) {
  return new Promise(function(resolve, reject) {
    if (_.isEmpty(location)) {
      msg.statusCode = 401;
      msg.message = 'empty input';
      reject(msg);
    } else {
      var url = 'https://' + settings.googleHost + '/maps/api/geocode/json?address=' + location + '&key=' + settings.googleApiKey;
      var json;
      request.get(url, function(err, res, body){
        console.log(body);
        if (res.statusCode != 200) {
          msg.statusCode = res.statusCode;
          msg.message = 'can not get response';
          reject(msg);
        } else if (err) {
          if (err.statusCode) {
            msg.statusCode = err.statusCode;
          } else {
            msg.statusCode = 400;
          }
          msg.message = err;
          reject(msg);
        } else {
          try {
            json = JSON.parse(body);
          }
          catch (err) {
            if (err.statusCode) {
              msg.statusCode = err.statusCode;
            } else {
              msg.statusCode = 400;
            }
            msg.message = err;
            reject(msg);
          }
          if (json.status != 'OK') {
            msg.statusCode = 406;
            msg.message = 'cannot find matching gps coordinate';
            reject(msg);
          } else {
            resolve(json.results[0].geometry.location);
          }
        }
      });
    }
  });
}

var teamscore = {

  // transfer location(city, state, country) info to gps coordinate
  getGpsCoordinate: function(location) {
    return getGpsCoordinate(location);
  },

  // transfer gps coordinate to time zone
  getTimezone: function(location) {
    return new Promise(function(resolve, reject) {
      getGpsCoordinate(location)
        .then(function(coordinate){
          //console.log(coordinate);
          // Use timestamp in sec
          var timestamp = Math.floor(new Date().getTime()/1000);
          var url = 'https://' + settings.googleHost + '/maps/api/timezone/json?location=' + coordinate.lat + ',' + coordinate.lng + '&timestamp=' + timestamp + '&key=' + settings.googleApiKey;
          var json;
          request.get(url, function(err, res , body){
            if (res.statusCode != 200) {
              reject ('error: ' + res.statusCode);
            } else if (err) {
              reject (err);
            } else {
              try {
                json = JSON.parse(body);
              }
              catch (err) {
                reject (err);
              }
              //console.log(json);
              var time = json.rawOffset/3600+json.dstOffset/3600;
              var result = {'Timezone':'UTC'+time};
              resolve(JSON.stringify(result));
            }
          });
        })
        .catch(function(err){
          reject (err);
        });
    });
  }
};

module.exports = teamscore;
