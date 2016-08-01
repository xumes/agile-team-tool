var chai = require('chai');
var expect = chai.expect;
var commonModel = require('../../models/common-cloudant');
var lodash = require('lodash');
var invalidAssessId ='30432_test';
var invalidRevisionId = '12-*219#';
var timeout = 30000;

describe("common cloudant model [deleteRecord]", function(){
  this.timeout(timeout);
  it("delete record [non-existing record id]", function(done){
    commonModel.deleteRecord(invalidAssessId, '')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete record [empty ids]", function(done){
    commonModel.deleteRecord('', '')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [null record id]", function(done){
    commonModel.deleteRecord(null, null)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [undefined ids]", function(done){
    commonModel.deleteRecord(undefined, undefined)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [empty id with undefined rev id]", function(done){
    commonModel.deleteRecord('', undefined)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [valid record id with empty revision id]", function(done){
    commonModel.deleteRecord('01a4073afd76c2cde8dcf42a56f25741', '')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [valid record id with null revision id]", function(done){
    commonModel.deleteRecord('01a4073afd76c2cde8dcf42a56f25741', null)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [valid record id with undefined revision id]", function(done){
    commonModel.deleteRecord('01a4073afd76c2cde8dcf42a56f25741', undefined)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No document/revision id provided for deletion.');
      })
      .finally(function(){
        done();
      })
  });

  //supply with test data with valid record id & revision id
  xit("delete assessment [valid record id with valid revision id]", function(done){
    commonModel.deleteRecord('01a4073afd76c2cde8dcf42a56f25741', '1-ec6a956f2d6f305f06a80c5f234fa8c4')
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body.ok).to.be.true;
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });

});