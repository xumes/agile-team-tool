var Promise = require('bluebird');

var requests = [];


//this function will cancel ajax calls to prevent things from executing
//i.e clicking between tabs quickly or clicking a squad/team and then clicking a tab
function clearRequests() {
  for (var i = 0; i < requests.length; i++)
    requests[i].abort();
  requests.length = 0;
}

module.exports.fetchTeamNames = function () {
  return new Promise(function(resolve, reject) {
    $.get('/api/teams/names')
      .complete(function(data) {
        resolve(data);
      })
      .fail(function(err) {
        reject(new Error('Unable to fetch team names'));
      });
  });
};

module.exports.getSquadTeams = function (filter) {
  var filter = typeof filter != 'undefined' ? encodeURI(JSON.stringify(filter)) : '';
  return new Promise(function(resolve, reject) {
    $.get('/api/teams/squads?filter=' + filter)
      .complete(function(data) {
        resolve(data);
      })
      .fail(function(err) {
        reject(new Error('Unable to fetch squad teams'));
      });
  });
};

module.exports.searchTeams = function (keyword) {
  return new Promise(function(resolve, reject){
    clearRequests();
    var url = '/api/teams/search/' + encodeURIComponent(keyword);
    var request = $.get(url)
      .complete(function(data){
        resolve (data);
      })
      .fail(function(err){
        reject (err);
      });
    requests.push(request);
  });
};

module.exports.getMyTeams = function() {
  return new Promise(function(resolve, reject){
    var rootTeamUrl = '/api/teams/lookup/rootteams/' + encodeURIComponent((user.ldap.uid).toUpperCase());
    var standaloneUrl = '/api/teams/lookup/standalone/' + encodeURIComponent((user.ldap.uid).toUpperCase());
    var req = $.when(
      $.ajax({
        type: 'GET',
        url: rootTeamUrl
      }),
      $.ajax({
        type: 'GET',
        url: standaloneUrl
      })
    ).done(function(data1, data2){
      var myteams = {
        teams: data1[0],
        standalone: data2[0]
      };
      resolve(myteams);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.getAllTeams = function() {
  return new Promise(function(resolve, reject){
    var url = '/api/teams/lookup/rootteams/';
    var req = $.ajax({
      type: 'GET',
      url: url
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.getChildrenTeams = function(pathId) {
  return new Promise(function(resolve, reject){
    if (pathId == 'agteamstandalone') {
      var url = '/api/teams/lookup/standalone/';
    } else {
      url = '/api/teams/children/' + encodeURIComponent(pathId);
    }
    var req = $.ajax({
      type: 'GET',
      url: url
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.loadTeamDetails = function(pathId) {
  return new Promise(function(resolve, reject){
    var url ='/api/teams/haschildren/' + encodeURIComponent(pathId);
    var req = $.ajax({
      type: 'GET',
      url: url
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.getAssessmentTemplate = function(teamId, status){
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/template?teamId=' + teamId + '&status=' + status;
    var req = $.ajax({
      type: 'GET',
      url: url
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};
