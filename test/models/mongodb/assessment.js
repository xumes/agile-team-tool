var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var assessmentModel = require('../../models/mongodb/assessment');

describe('Assessment Model', function() {
  after(function() {
    // delete all documents that was created during this test
  });

  describe('assessment models [getAssessmentTemplate]', function() {
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

  });

  describe('assessment model [addTeamAssessment] ', function() {
    it('valid assessment with non-existing user', function() {
      //
    });

    it('add assessment [valid assessment data]', function() {
      //
    });
  });

  describe('assessment models [getTeamAssessments]', function() {
    it('retrieve team assessments [valid team id]', function() {
      //
    });

    it('retrieve team assessments [valid team id-all assessment information]', function() {
      //
    });

    it('retrieve team assessments [non-existing team id]', function() {
      //
    });

    it('retrieve team assessments [empty team id]', function() {
      //
    });
  });

  describe('assessment model [getAssessment] ', function() {

    it('retrieve assessment [non-existing assessment id]', function() {
      //
    });

    it('retrieve assessment [empty assessment id]', function() {
      //
    });

    it('retrieve assessment [valid assessment id]', function() {
      //
    });

  });

  describe('assessment model [updateTeamAssessment] ', function() {
    it('update assessment [no assessment id]', function() {
      //
    });

    it('update assessment [empty assessment id]', function() {
      //
    });

    it('update assessment [valid assessment data] with non-existing user', function() {
      //
    });

    it('update assessment [valid assessment data] invalid revision id', function() {
      //
    });

    it('update assessment [valid assessment data]', function() {
      //
    });

  });

  describe('assessment model [deleteAssessment] ', function() {
    it('delete assessment [non-existing assessment id]', function() {
      //
    });

    it('delete assessment [empty assessment id]', function() {
      //
    });

    it('delete assessment [non-existing revision id]', function() {
      //
    });

    it('delete assessment [empty revision id]', function() {
      //
    });

    it('delete assessment [invalid assessment id and revision id]', function() {
      //
    });

    it('delete assessment [valid assessment and revision id] using admin user', function() {
      //
    });
  });
});
