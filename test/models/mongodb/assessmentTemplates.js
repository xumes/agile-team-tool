var chai = require('chai');
var expect = chai.expect;
var assessmentTemplates = require('../../../models/mongodb/assessmentTemplates');

var testData = {
  initTemplate : function() {
    return {
      cloudantId : 'cloudant_id_for_assessment_template',
      version : 1,
      effectiveDate : new Date(),
      status : 'inactive'
    };
  },
  noComponents: function() {
    var template = this.initTemplate();
    template['components'] = [];
    return template;
  },
  invalidComponents: function() {
    var template = this.initTemplate();
    template['components'] = [{
      name: '',
      principles: [],

    }];
    return template;
  },
  invalidComponentsPrinciple: function() {
    var template = this.initTemplate();
    template['components'] = [{
      name: 'Component name',
      principles: [{
        id: '',
        name: '',
        practices: []
      }],
    }];
    return template;
  }
};

describe('Assessment Template model [create]', function() {
  it('will fail because assessment template data is required', function(done){
    assessmentTemplates.create()
      .catch(function(err) {
        expect(err).to.be.equal('Assessment template data is required');
        done();
      });
  });

  it('will fail because assessment template components is required', function(done){
    assessmentTemplates.create(testData.noComponents())
      .catch(function(err) {
        expect(err).to.be.equal('Assessment template components is required');
        done();
      });
  });

  it('will fail because assessment template components is invalid', function(done){
    assessmentTemplates.create(testData.invalidComponents())
      .catch(function(err) {
        expect(err).to.be.equal('Assessment template components is invalid');
        done();
      });
  });

  it('will fail because assessment template components principles is invalid', function(done){
    //console.log(JSON.stringify(testData.invalidComponentsPrinciple(), null, 4));
    assessmentTemplates.create(testData.invalidComponentsPrinciple())
      .catch(function(err) {
        expect(err).to.be.equal('Assessment template components principles is invalid');
        done();
      });
  });
});

describe('Assessment Template model [get]', function() {
  it('return null for non existing user');
});

describe('Assessment Template model [update]', function() {
  it('return null for non existing user');
});

describe('Assessment Template model [delete]', function() {
  it('return null for non existing user');
});
