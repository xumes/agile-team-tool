'use strict';
var _          = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient;
var assert     = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var templates = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'ref_matassessment'; });
var templates = _.pluck(templates, 'doc');

var util = require('./util.js');

var mongoTemplates = [];
_.each(templates, function(doc){
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? null : val; });
  doc = JSON.stringify(doc);
  var mappedDoc = JSON.parse(doc, function(k, v) {
    if (k === '_rev' || k === 'type'){
      console.log('skipping: ' + k);
    }
    else if (k === '_id')
      this.cloudantId = v;
    else if (k === 'atma_version')
      this.version = parseInt(v);
    else if (k === 'atma_eff_dt')
      this.effectiveDate = util.stringToUtcDate(v);
    else if (k === 'atma_status')
      this.status = v;
    else if (k === 'atma_cmpnt_tbl')
      this.components = v;
    else if (k === 'atma_name')
      this.name = v;
    else if (k === 'principle_tbl')
      this.principles = v;
    else if (k === 'principle_id')
      this.id = parseInt(v);
    else if (k === 'principle_name')
      this.name = v;
    else if (k === 'practice_tbl')
      this.practices = v;
    else if (k === 'practice_id')
      this.id = parseInt(v);
    else if (k === 'practice_name')
      this.name = v;
    else if (k === 'practice_desc')
      this.description = v;
    else if (k === 'mat_criteria_tbl')
      this.levels = v;
    else if (k === 'mat_lvl_name')
      this.name = v;
    else if (k === 'mat_lvl_score')
      this.score = parseInt(v);
    else if (k === 'mat_lvl_criteria')
      this.criteria = v;
    else
      return v;
  });
  mongoTemplates.push(mappedDoc);
});

var creds = require('./creds');
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db.collection('assessmentTemplates')
    .drop()
    .then(function(){
      db.collection('assessmentTemplates').insertMany(mongoTemplates, function(err, r) {
        assert.equal(null, err);
        console.log('Done!  ' + JSON.stringify(r.result));
        db.close();
        process.exit();
      });
    });
});
