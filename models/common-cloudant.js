/**
 * This contains common cloudant calls
 */

var Cloudant = require('cloudant');
var settings = require('../settings');
var cloudantDb = Cloudant('https://' + settings.cloudant.userName + ':' + settings.cloudant.password + '@' + settings.cloudant.userName + '.cloudant.com');

var dbName = settings.cloudant.dbName;
var agileTeam = cloudantDb.use(dbName);

exports.addRecord = function(data, callback) {
  agileTeam.insert(data, function(err, body) {
    if (err) {
      callback(err);
      return;
    }
    if (body.rows.length > 0) {
      callback(null, body);
      return;
    } else {
      callback(null, null);
      return;
    }
  });
};

exports.getRecord = function(data, callback) {
  agileTeam.get(data, function(err, body) {
    if (err) {
      callback(err);
      return;
    }
    if (body.rows.length > 0) {
      callback(null, body);
      return;
    } else {
      callback(null, null);
      return;
    }
  });
};

exports.updateRecord = function(data, callback) {
  agileTeam.insert(data, function(err, body) {
    if (err) {
      callback(err);
      return;
    }
    if (body.rows.length > 0) {
      callback(null, body);
      return;
    } else {
      callback(null, null);
      return;
    }
  });	
};


exports.deleteRecord = function(_id, _rev, callback) {
  agileTeam.destroy(_id, _rev, function(err, body) {
    if (err) {
      callback(err);
      return;
    }
    if (body.rows.length > 0) {
      callback(null, body);
      return;
    } else {
      callback(null, null);
      return;
    }
  });
};

exports.getByView = function(_design, _view, callback) {
  agileTeam.view(_design, _view,
      {'include_docs': false }, function(err, body) {
        if (err) {
          callback(err);
          return;
        }
        if (body.rows.length > 0) {
          callback(null, body);
          return;
        } else {
          callback(null, null);
          return;
        }
      });
};

exports.getByViewKey = function(_design, _view, _key, callback) {
  agileTeam.view(_design, _view,
      {'include_docs': false, key: _key }, function(err, body) {
        if (err) {
          callback(err);
          return;
        }
        if (body.rows.length > 0) {
          callback(null, body);
          return;
        } else {
          callback(null, null);
          return;
        }
      });
};