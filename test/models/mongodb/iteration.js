var chai = require('chai');
var expect = chai.expect;
var iterationModel = require('../../../models/mongodb/iteration');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var moment = require('moment');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var validIterationDoc = {
  'name': 'test-01',
  'teamId': '57e060593e3e6351c39e1b3f',
  'memberCount': 1,
  'startDate': moment(new Date('08-01-2016')).format(dateFormat),
  'endDate': moment().format(dateFormat)
};
var newIterationId = Schema.Types.ObjectId;
var validUser = new Object();
validUser['shortEmail'] = 'Yanliang.Gu1@ibm.com';
var notExistingUser = new Object();
notExistingUser['shortEmail'] = 'notexisting';
var inValidUser = new Object();
inValidUser['shortEmail'] = 'lenka.treflikova@sk.ibm.com';

describe('Iteration model [add]', function() {
  before(function(done){
    var request = {
      'name': validIterationDoc.name,
      'teamId': validIterationDoc.teamId
    };

    iterationModel.deleteByFields(request)
      .then(function(result){
        done();
      })
      .catch(function(err){
        done();
      });
  });

  it('return successful for adding an iteration', function(done) {
    iterationModel.add(validIterationDoc, validUser)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('_id');
        newIterationId = result._id;
        done();
      });
  });

  it('return fail for adding a duplicate name iteration', function(done){
    iterationModel.add(validIterationDoc, validUser)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });

  it('return fail because the user is not existing', function(done){
    iterationModel.add(validIterationDoc, notExistingUser)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });

  it('return fail because the user is invalid to add iteration to this team', function(done){
    iterationModel.add(validIterationDoc, inValidUser)
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err).to.have.property('error');
        done();
      });
  });
});

describe('Iteration model [getByIterInfo]', function() {
  it('return successful for retriveing a iteration by teamId', function(done) {
    iterationModel.getByIterInfo(validIterationDoc.teamId)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });

  it('return successful for retriveing all iterations', function(done) {
    iterationModel.getByIterInfo('',10)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
});

describe('Iteration model [get]', function() {
  it('return successful for retriveing a iteration by id', function(done) {
    iterationModel.get(newIterationId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('_id');
        done();
      });
  });
});

describe('Iteration model [getCompletedIterationsByKey]', function() {
  it('return successful for retriveing a iteration by time', function(done) {
    iterationModel.getCompletedIterationsByKey(validIterationDoc.startDate, validIterationDoc.endDate)
      .then(function(result){
        expect(result).to.be.a('array');
        expect(result.length).not.to.equal(0);
        done();
      });
  });
});

describe('Iteration model [edit]', function() {
  it('return successful for updating a iteration', function(done) {
    validIterationDoc.memberCount = 2;
    iterationModel.edit(newIterationId, validIterationDoc, validUser)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('ok');
        done();
      });
  });
});

describe('Iteration model [delete]', function() {
  it('return successful for deleteing a iteration by id', function(done) {
    iterationModel.delete(newIterationId)
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result).to.have.property('result');
        done();
      });
  });
});
