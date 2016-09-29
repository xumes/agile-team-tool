var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
//var validAssessments = require('./testData/validAssessments');
var Assessments = require('../../../models/mongodb/assessments');

describe('Assessment Model', function() {
  xdescribe('assessment model [addTeamAssessment] ', function() {
    it('valid assessment with non-existing user');

    xit('add assessment [valid assessment data]');
  });

  xdescribe('assessment models [getTeamAssessments]', function() {
    it('retrieve team assessments [valid team id]');

    it('retrieve team assessments [valid team id-all assessment information]');

    it('retrieve team assessments [non-existing team id]');

    it('retrieve team assessments [empty team id]');
  });

  xdescribe('assessment model [getAssessment] ', function() {

    it('retrieve assessment [non-existing assessment id]');

    it('retrieve assessment [empty assessment id]');

    it('retrieve assessment [valid assessment id]');

  });

  xdescribe('assessment model [updateTeamAssessment] ', function() {
    it('update assessment [no assessment id]');

    it('update assessment [empty assessment id]');

    it('update assessment [valid assessment data] with non-existing user');

    it('update assessment [valid assessment data] invalid revision id');

    it('update assessment [valid assessment data]');

  });

  xdescribe('assessment model [deleteAssessment] ', function() {
    it('delete assessment [non-existing assessment id]');

    it('delete assessment [empty assessment id]');

    it('delete assessment [non-existing revision id]');

    it('delete assessment [empty revision id]');

    it('delete assessment [invalid assessment id and revision id]');

    it('delete assessment [valid assessment and revision id] using admin user');
  });
});
