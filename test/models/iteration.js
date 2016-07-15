"use strict";
var root_path = '../../';
var app = require(root_path + 'app');
var expect = require('chai').expect;
var rewire = require('rewire');

var iterationModel = rewire(root_path + 'models/iteration');

describe('Iteration Model', function() {

  describe('[getByIterinfo]: Get iteration document', function() {
    it('Get a specific team iteration document', function(done) {
      var id = 'ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804';
      var key = 'ag_team_alpha_1466884828673';

      iterationModel.__set__(
        {
          common: {
            getByViewKey: function (_design, _view, _key, callback) {
              var rows = {
                    "total_rows": 10,
                    "offset": 2,
                    "rows": [{
                        "id": "ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804",
                        "key": "ag_team_alpha_1466884828673",
                        "value": {
                          "_id": "ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804",
                          "_rev": "2-f2d65b0d65cbcae1b1c8f611590e741c",
                          "team_id": "ag_team_alpha_1466884828673"
                        }
                    }]
                  };
              callback(null, rows);
            }
          }
        }
      );
      iterationModel.getByIterinfo(key, function(err, result) {
        expect(result).to.be.a('object');
        expect(result.rows[0].id).to.be.equal(id);
        expect(result.rows[0].key).to.be.equal(key);
        done();
      });
    });

    it('Get all team iteration documents', function(done) {
      var key = undefined;

      iterationModel.__set__(
        {
          common: {
            getByView: function (_design, _view, callback) {
              var rows = {
                    "total_rows": 10,
                    "offset": 2,
                    "rows": [{
                        "id": "ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804",
                        "key": "ag_team_Alpha_1466884828673",
                        "value": {
                          "_id": "ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804",
                          "_rev": "2-f2d65b0d65cbcae1b1c8f611590e741c",
                          "team_id": "ag_team_Alpha_1466884828673"
                        }
                    }, {
                        "id": "ag_iterationinfo_ag_team_bravo_1466884828673_01dummy_1466885720804",
                        "key": "ag_team_Bravo_1466884828673",
                        "value": {
                          "_id": "ag_iterationinfo_ag_team_bravo_1466884828673_01dummy_1466885720804",
                          "_rev": "2-f2d65b0d65cbcae1b1c8f611590e741c",
                          "team_id": "ag_team_Bravo_1466884828673"
                        }
                    }]
                  };
              callback(null, rows);
              return;
            }
          }
        }
      );
      iterationModel.getByIterinfo(key, function(err, result) {
        expect(result).to.be.a('object');
        expect(result.rows.length).to.be.equal(2);
        done();
      });
    });
  });

  describe('[getCompletedIterations]: Get completed iteration', function() {
    it('Get completed iteration documents', function(done) {
      var startkey = undefined;
      var endkey = undefined;
      iterationModel.__set__(
        {
          agileTeam: {
            view: function (_design, _view, _params, callback) {
              var rows = {
                    "total_rows": 10,
                    "offset": 2,
                    "rows": [{
                        "id": "ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804",
                        "key": "ag_team_alpha_1466884828673",
                        "value": {
                          "_id": "ag_iterationinfo_ag_team_alpha_1466884828673_01dummy_1466885720804",
                          "_rev": "2-f2d65b0d65cbcae1b1c8f611590e741c",
                          "team_id": "ag_team_alpha_1466884828673"
                        }
                    }]
                  };
              callback(null, rows);
            }
          }
        }
     );

      iterationModel.getCompletedIterations(startkey, endkey, function(err, result) {
        expect(result).to.be.a('object');
        done();
      });
    });

    it('No completed iteration found', function(done) {
      var startkey = undefined;
      var endkey = undefined;
      iterationModel.__set__(
        {
          agileTeam: {
            view: function (_design, _view, _params, callback) {
              var rows = {};
              callback(null, rows);
            }
          }
        }
     );

      iterationModel.getCompletedIterations(startkey, endkey, function(err, result) {
        expect(result).to.be.a('null');
        done();
      });
    });
  });
});
