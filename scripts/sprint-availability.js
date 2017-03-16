require('../settings');
var _ = require('underscore');
var business = require('moment-business');
var moment = require('moment');
//var api = require('../public/js/components/api.jsx');
//var utils = require('../public/js/components/utils.jsx');
var teamModel = require('../models/mongodb/teams');

//var schedule = require('node-schedule');
//var users = require('../models/mongodb/users');
var iterationModel = require('../models/mongodb/iterations');
var request = require('request');
var Promise = require('bluebird');
var workerLogger = require('../middleware/logger').get('worker');
var promiseArray = [];
var iterationArray = [];
var readyToUpdateIterations = [];
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

iterationModel.getNotCompletedIterations()
  .then(function(iterations) {
    console.log('result length: '+iterations.length);
    //loop through here to calculate Sprint
    _.each(iterations, function(iteration) {
      iterationArray.push(iteration);
      promiseArray.push(teamModel.getTeam(iteration.teamId));
    });
    return Promise.all(promiseArray);
  })
  .then(function(teams) {
    _.each(iterationArray, function(iteration){
      var maxWorkDays  = 0;
      if (iteration.startDate !=undefined && iteration.endDate!=undefined)
      {
        maxWorkDays = business.weekDays(moment.utc(iteration.startDate),moment.utc(iteration.endDate));
        if (business.isWeekDay(moment.utc(iteration.endDate)))
          maxWorkDays++;
    //    console.log('Iteration id is : '+iteration._id+'start date: '+ moment.utc(iteration.startDate).format('DDMMMYYYY') + ' end date: '+moment.utc(iteration.endDate).format('DDMMMYYYY')+' Workday is: '+maxWorkDays);
      }

      var matchedTeam = _.find(teams, function(team) {
        if (JSON.stringify(team._id) == JSON.stringify(iteration.teamId)) return team;
      });


      var members = [];
      var availability = 0;
      if (matchedTeam.members!=undefined && matchedTeam.members.length>0)
        members = matchedTeam.members;

      _.each(members, function(member){
        var allocation =  member.allocation/100;
        var avgWorkWeek = 0;
        if (member.workTime !=null)
        {
          if (!isNaN(parseInt(member.workTime)))
            avgWorkWeek = member.workTime;
          else
            avgWorkWeek = 0;
        }
        else
          avgWorkWeek = 100;

        avgWorkWeek = avgWorkWeek/100;
        availability += (allocation * avgWorkWeek * maxWorkDays);
      });

      iteration.teamAvailability = availability;
      iteration.personDaysUnavailable = 0;
      iteration.personDaysAvailable = (iteration.teamAvailability - iteration.personDaysUnavailable).toFixed(2);
      console.log('Team Name: '+matchedTeam.name + ' | Iteration Name: '+ iteration.name+' id: '+iteration._id+ ' | # of team members: '+matchedTeam.members.length+' Work days in this iteration: '+maxWorkDays+' | Team availability: '+iteration.teamAvailability + ' | Person days available: '+iteration.personDaysAvailable);
      var updateIteration = {
        '_id': iteration._id,
        'set': {
          'teamAvailability': iteration.teamAvailability,
          'personDaysUnavailable': iteration.personDaysUnavailable,
          'personDaysAvailable': iteration.personDaysAvailable
        }
      };

      //push ready to update onto a collection:
      readyToUpdateIterations.push(updateIteration);
    });
    return readyToUpdateIterations;
  })
  .then(function (readyToUpdateIterations){
    console.log(' Prepare to update Iteration in bulk and readyToUpdateIteration length is: '+readyToUpdateIterations.length);
    return iterationModel.bulkUpdateIterations(readyToUpdateIterations);
  })
  .then(function(result) {
    workerLogger.verbose('Successfully get "Not Complete" iterations.');
    return null;
  })
  .catch(function(err) {
    workerLogger.error('Unable to process "Not Complete" iterations err=', err.error);
    console.log('error - '+err);
    return null;
  });
