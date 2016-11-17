var Promise = require('bluebird');

var teamApi = {
  fetchTeamMemberRoles: function () {
    return new Promise(function(resolve, reject) {
      $.get('/api/teams/roles')
        .complete(function(data) {
          resolve(data);
        })
        .fail(function(err) {
          reject(new Error('Unable to fetch member roles'));
        });
    });
  },
  postTeam: function(data) {
    return new Promise(function(resolve, reject){
      var url = '/api/teams';
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
  },
  putTeam: function(data) {
    return new Promise(function(resolve, reject){
      var url = '/api/teams';
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
  },
  deleteTeam: function(data) {
    return new Promise(function(resolve, reject){
      var url = '/api/teams';
      var req = $.ajax({
        type: 'DELETE',
        url: url,
        data: data
      }).done(function(data){
        resolve(data);
      }).fail(function(err){
        reject(err);
      });
    });
  },
  getSelectableParents: function(teamId) {
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
  },
  getSelectableChildren: function(teamId) {
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
  },
  associateTeam: function(parentTeamId, childTeamId) {
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
  },
  removeAssociation: function(childTeamId) {
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
  }
};

module.exports = teamApi;
