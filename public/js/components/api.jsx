var Promise = require('bluebird');
var _ = require('underscore');
Promise.config({
  warnings: false
});
var requests = [];


//this function will cancel ajax calls to prevent things from executing
//i.e clicking between tabs quickly or clicking a squad/team and then clicking a tab
function clearRequests() {
  for (var i = 0; i < requests.length; i++)
    requests[i].abort();
  requests.length = 0;
}

module.exports.getFaceImage = function(uid) {
  return new Promise(function(resolve, reject){
    var url = 'http://dpev027.innovate.ibm.com:10000/image/' + encodeURIComponent(uid.toUpperCase());
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

module.exports.getSystemStatus = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/util/systemstatus';
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

module.exports.getNonSquadTeams = function (filter) {
  var filter = typeof filter != 'undefined' ? encodeURI(JSON.stringify(filter)) : '';
  return new Promise(function(resolve, reject) {
    $.get('/api/teams/nonsquads?filter=' + filter)
      .complete(function(data) {
        resolve(data);
      })
      .fail(function(err) {
        reject(new Error('Unable to fetch non squad teams'));
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

module.exports.hasChildrenByPathId = function(pathId) {
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

module.exports.loadTeamDetails = function(pathId) {
  return new Promise(function(resolve, reject){
    var url ='/api/teams/teamchilddetail/' + encodeURIComponent(pathId);
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

module.exports.loadTeam = function(objectId) {
  return new Promise(function(resolve, reject){
    var url ='/api/teams/' + encodeURIComponent(objectId);
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

module.exports.getTeamHierarchy = function(path) {
  return new Promise(function(resolve, reject){
    var url ='/api/teams/hierarchy/team/' + encodeURIComponent(path);
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

module.exports.getTeamSnapshots = function(objectId) {
  return new Promise(function(resolve, reject){
    var url ='/api/snapshot/get/' + encodeURIComponent(objectId);
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

module.exports.getSquadIterations = function(objectId) {
  return new Promise(function(resolve, reject){
    var url = '/api/iteration/searchTeamIteration?id=' + encodeURIComponent(objectId);
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

module.exports.getSquadAssessments = function(objectId) {
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/view?teamId=' + encodeURIComponent(objectId);
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

module.exports.getAssessmentDetails = function(assessId) {
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/view?assessId=' + encodeURIComponent(assessId);
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

module.exports.isUserAllowed = function(objectId) {
  return new Promise(function(resolve, reject){
    var url = '/api/users/isuserallowed?teamId=' + encodeURIComponent(objectId);
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

module.exports.getUsersInfo = function(userIds) {
  return new Promise(function(resolve, reject){
    var requestData = {
      'ids': userIds
    };
    var url = '/api/users/info';
    var req = $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(requestData),
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

module.exports.deleteAssessment = function(assessId) {
  return new Promise(function(resolve, reject){
    var data = {
      'docId': assessId
    };
    var url = '/api/assessment';
    var req = $.ajax({
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify(data),
      url: url
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.getIterationInfo = function(id) {
  return new Promise(function(resolve, reject){
    var url = '/api/iteration/current/' + encodeURIComponent(id);
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

module.exports.getIterations = function(teamId) {
  return new Promise(function(resolve, reject){
    var url = '/api/iteration/searchTeamIteration?id=' + encodeURIComponent(teamId);
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

module.exports.addIteration = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/iteration';
    var req = $.ajax({
      type: 'POST',
      url: url,
      data: data
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.updateIteration = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/iteration/'+encodeURIComponent(data._id);
    var req = $.ajax({
      type: 'PUT',
      url: url,
      data: data
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.searchTeamIteration = function(teamId, startDate, enddate, limit, status) {
  return new Promise(function(resolve, reject){
    var url = '/api/iteration/searchTeamIteration?id=' + encodeURIComponent(teamId);
    if (!_.isEmpty(startDate)) {
      url += '&startdate=' + startDate;
    }
    if (!_.isEmpty(enddate)) {
      url += '&enddate=' + enddate;
    }
    if (!isNaN(limit)) {
      url += '&limit=' + limit;
    }
    if (!isNaN(status)) {
      url += '&status=' + status;
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

module.exports.getTemplateByVersion = function(version) {
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/template/version/' + encodeURIComponent(version);
    var req = $.ajax({
      type: 'GET',
      url: url,
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.addAssessment = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/';
    var req = $.ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.updateAssessment = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/';
    var req = $.ajax({
      type: 'PUT',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.getTeamAssessments = function(teamId, assessId) {
  return new Promise(function(resolve, reject){
    var url = '/api/assessment/view?teamId=' + encodeURIComponent(teamId) + '&assessId=' + encodeURIComponent(assessId);
    var req = $.ajax({
      type: 'GET',
      url: url,
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.modifyTeamMembers = function(teamId, newMembers) {
  return new Promise(function(resolve, reject){
    var data = {
      '_id' : teamId,
      'members': newMembers
    };
    var url = '/api/teams/members';
    var req = $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      url: url,
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.fetchTeamMemberRoles = function () {
  return new Promise(function(resolve, reject) {
    var url = '/api/teams/roles';
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

module.exports.createUser = function(newUser) {
  return new Promise(function(resolve, reject) {
    var url = '/api/users/create';
    var req = $.ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(newUser)
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.deleteTeam = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams';
    var req = $.ajax({
      type: 'DELETE',
      contentType: 'application/json',
      url: url,
      data: data
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.getSelectableParents = function(teamId) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams/lookup/parents/' + encodeURIComponent(teamId);
    var req = $.ajax({
      type: 'GET',
      url: url
    }).done(function(data){
      return resolve(data);
    }).fail(function(err){
      return reject(err);
    });
  });
};

module.exports.putTeam = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams';
    var req = $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      url: url,
      data: data
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.postTeam = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams';
    var req = $.ajax({
      type: 'POST',
      contentType: 'application/json',
      url: url,
      data: data
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.associateTeam = function(parentTeamId, childTeamId) {
  return new Promise(function(resolve, reject) {
    var requestData = {
      'parentTeamId': parentTeamId,
      'childTeamId': childTeamId
    };
    var url = '/api/teams/associates';
    var req = $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(requestData),
      url: url
    }).done(function(data){
      return resolve(data);
    }).fail(function(err){
      return reject(err);
    });
  });
};

module.exports.removeAssociation = function(childTeamId) {
  return new Promise(function(resolve, reject) {
    var requestData = {
      'childTeamId': childTeamId
    };
    var url = '/api/teams/removeassociation';
    var req = $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(requestData),
      url: url
    }).done(function(data){
      return resolve(data);
    }).fail(function(err){
      return reject(err);
    });
  });
};

module.exports.getSelectableChildren = function(teamId) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams/lookup/children/' + encodeURIComponent(teamId);
    var req = $.ajax({
      type: 'GET',
      url: url
    }).done(function(data){
      return resolve(data);
    }).fail(function(err){
      return reject(err);
    });
  });
};

module.exports.fetchTeamLinkLabels = function() {
  return new Promise(function(resolve, reject) {
    $.get('/api/teams/linklabels')
      .complete(function(data) {
        resolve(data);
      })
      .fail(function(err) {
        reject(new Error('Unable to fetch link labels'));
      });
  });
};

module.exports.deleteLink = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams/links';
    var req = $.ajax({
      type: 'DELETE',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
};

module.exports.updateLink = function(data) {
  return new Promise(function(resolve, reject){
    var url = '/api/teams/links';
    var req = $.ajax({
      type: 'PUT',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      resolve(data);
    }).fail(function(err){
      reject(err);
    });
  });
}
