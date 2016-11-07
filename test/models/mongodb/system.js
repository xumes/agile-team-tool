var chai = require('chai');
var expect = chai.expect;
var System = require('../../../models/mongodb/system');
var _ = require('underscore');

describe('SystemConstants Model Test', function() {
  it('return all member roles', function(done) {
    System.getTeamMemberRoles()
      .then(function(result) {
        expect(result).to.be.a('array');
        done();
      });
  });

  it('return all link labels', function(done) {
    System.getTeamLinkLabels()
      .then(function(result) {
        expect(result).to.be.a('array');
        done();
      });
  });

  it('return current system status', function(done) {
    System.getSystemStatus()
      .then(function(result) {
        if (!_.isEmpty(result)) {
          expect(result).to.be.a('object');
        }
        done();
      });
  });
});
