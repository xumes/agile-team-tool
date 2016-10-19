var chai = require('chai');
var expect = chai.expect;
var snapshotModel = require('../../../models/mongodb/snapshot');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

describe('Snapshot Model Test', function(){
  describe('Snapshot model [updateRollUpData]', function(){
    it('return successful for updating roll up data', function(done) {
      snapshotModel.updateRollUpData()
        .then(function(result){
          expect(result).to.be.a('string');
          done();
        });
    });
  });

  describe('Snapshot model [completeIterations]', function(){
    it('return successful for updating iterations', function(done) {
      snapshotModel.completeIterations()
        .then(function(result){
          done();
        });
    });
  });
});
