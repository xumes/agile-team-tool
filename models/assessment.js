/* Put cloudant calls for team here */
var common = require('./common-cloudant');

exports.getTeamAssessments = function(teamId, callback) {
  common.getByViewKey('agile', 'maturityAssessmentResult', teamId, callback);
};

exports.getAssessmentTemplate = function(callback) {
  common.getByView('agile', 'maturityAssessment', teamId, callback);
};

exports.addTeamAssessment = function(data, callback) {
  common.addRecord(data, callback);
};

exports.updateTeamAssessment = function(data, callback) {
  common.updateRecord(data, callback);
};

exports.deleteAssessment = function(_id, _rev, callback) {
  common.deleteRecord(_id, _rev, callback);
};