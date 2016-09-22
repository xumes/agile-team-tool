var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var assessmentModel = require('../../../models/mongodb/assessment');
var teams = require('../../../models/mongodb/teams');
var util = require('../../../helpers/util');
var lodash = require('lodash');
var dummyData = require('../../data/dummy-data.js');
var testData = require('../../data/assessment');
var curr_assessment = testData.currentAssessment;

describe('Assessment Model', function() {
  describe('assessment model [addTeamAssessment] ', function() {
    it('valid assessment with non-existing user', function(done) {
      var valAssessment = lodash.cloneDeep(curr_assessment);
      valAssessment.created_dt = util.getServerTime();
      valAssessment.created_user = 'test.user@ph.ibm.com';
      assessmentModel.addTeamAssessment('test.user@ph.ibm.com', valAssessment)
        .catch(function(err) {
          expect(err).to.be.an('object');
          expect(err).to.have.property('error');
          expect(err.error).to.equal('Unauthorized user.');
          done();
        });
    });

    xit('add assessment [valid assessment data]', function(done) {
      var valAssessment = lodash.cloneDeep(curr_assessment);
      //console.log('valAssessment: ', valAssessment);
      assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
        .then(function(body) {
          expect(body).to.be.an('object');
          expect(body.ok).to.be.true;
          expect(body.id).to.be.equal(valAssessment._id);
          assessmentIds.push(body.id);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  describe('assessment models [getTeamAssessments]', function() {
    it('retrieve team assessments [valid team id]');

    it('retrieve team assessments [valid team id-all assessment information]');

    it('retrieve team assessments [non-existing team id]');

    it('retrieve team assessments [empty team id]');
  });

  describe('assessment model [getAssessment] ', function() {

    it('retrieve assessment [non-existing assessment id]');

    it('retrieve assessment [empty assessment id]');

    it('retrieve assessment [valid assessment id]');

  });

  describe('assessment model [updateTeamAssessment] ', function() {
    it('update assessment [no assessment id]');

    it('update assessment [empty assessment id]');

    it('update assessment [valid assessment data] with non-existing user');

    it('update assessment [valid assessment data] invalid revision id');

    it('update assessment [valid assessment data]');

  });

  describe('assessment model [deleteAssessment] ', function() {
    it('delete assessment [non-existing assessment id]');

    it('delete assessment [empty assessment id]');

    it('delete assessment [non-existing revision id]');

    it('delete assessment [empty revision id]');

    it('delete assessment [invalid assessment id and revision id]');

    it('delete assessment [valid assessment and revision id] using admin user');
  });
});
/*describe('assessment models [getAssessmentTemplate]', function() {
    it('retrieve assessment template', function() {
      //
    });
  });

  describe('assessment models [document validation]', function() {
    it('draft assessment with no created date', function() {
      //
    });

    it('valid draft assessment from team member', function() {
      //
    });

    it('draft assessment for update (using parent team member)', function() {
      //
    });

    it('new submitted assessment (unaswered question)', function() {
      //
    });

    it('update assessment (unaswered question)', function() {
      //
    });


    it('new submitted assessment (invalid project type)', function() {
      //
    });

    it('new submitted assessment (no overall assessment score)', function() {
      //
    });


    it('new submitted assessment (incomplete action plan field)', function() {
      //
    });

  });*/
