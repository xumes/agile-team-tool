require('../settings');

var schedule = require('node-schedule');
var users = require('../models/mongodb/users');
var request = require('request');
var Promise = require('bluebird');
var workerLogger = require('../middleware/logger').get('worker');


schedule.scheduleJob('* * 2 * *', function() {
  var queryUser = function(user) {
    return new Promise(function(resolve) {
      var bluepagesURL = process.env.bluepagesURL;
      var requestURL = bluepagesURL + '/id/' + user.userId + '/uid';
      request(requestURL, function(err, response, body) {
        var body = JSON.parse(body) ; // if the body is STRING, try to parse it
        if (response.statusCode == 404 && body.message == 'Unable to find record') {
          user.remove();
          workerLogger.info('User', user.email, 'unable to get Bluepages record');
        }
        else {
          workerLogger.info('User', user.email, 'still exists in Bluepages');
        }
        resolve();
      });
    });
  };

  users.getAllUsers()
    .then(function(users) {
      return Promise.mapSeries(users, function(user) {
        return queryUser(user);
      });
    });
});
