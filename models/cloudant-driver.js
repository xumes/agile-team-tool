var Promise = require('bluebird');
var Cloudant = require('cloudant');
var _ = require('underscore');
var lodash = require('lodash');
var settings = require('../settings');
var loggers = require('../middleware/logger');
var dbName = settings.cloudant.dbName;

var cloudantDb = Cloudant(settings.cloudant.url, function(err, cloudant, reply) {
  if (err)
    loggers.get('init').error("Failed to initialize Cloudant: " + err.message);
  else {
    loggers.get('init').info("Cloudant User: " + reply.userCtx.name);
    loggers.get('init').info("Cloudant User Roles: " + reply.userCtx.roles + "\n");
  }
});

var db = Promise.promisifyAll(cloudantDb.use(dbName));


var formatErrMsg = /* istanbul ignore next */ function(msg) {
  loggers.get('models').error('Error: ' + msg);
  return {
    error: msg
  };
};

exports.addRecord = function(data) {
  return new Promise(function(resolve, reject) {
    db.insertAsync(data)
      .then(function(body) {
        resolve(body);
      })
      .catch(function(err) {
        reject(err);
      })
  });
};

exports.getRecord = function(data) {
  return new Promise(function(resolve, reject) {
    db.getAsync(data)
      .then(function(body) {
        resolve(body);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

exports.updateRecord = function(data) {
  // revision _id is required on data
  return new Promise(function(resolve, reject) {
    db.insertAsync(data)
      .then(function(body) {
        resolve(body);
      })
      .catch(function(err) {
        reject(err);
      })
  });
};

exports.deleteRecord = function(_id, _rev) {
  return new Promise(function(resolve, reject) {
    loggers.get('models').verbose('Deleting record ' + _id + ' rev: ' + _rev);
    if (!lodash.isEmpty(_id) && !lodash.isEmpty(_rev)) {
      db.destroyAsync(_id, _rev)
        .then(function(body) {
          loggers.get('models').verbose('Success: Record ' + _id + ' rev: ' + _rev + ' has been deleted successfully.');
          resolve(body);
        })
        .catch(function(err) {
          reject(err);
        });
    } else { /* istanbul ignore next */
      reject(formatErrMsg('No document/revision id provided for deletion.'));
    }
  });
};

exports.getByView = function(_design, _view) {
  return new Promise(function(resolve, reject) {
    db.viewAsync(_design, _view)
      .then(function(body) {
        body = _.isEmpty(body.rows) ? {} : body;
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

exports.getByViewKey = function(_design, _view, _key) {
  return new Promise(function(resolve, reject) {
    db.viewAsync(_design, _view, {
        'include_docs': false,
        key: _key
      })
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

exports.getByViewWithStartOrEndKey = function(_design, _view, _startkey, _endkey) {
  return new Promise(function(resolve, reject) {
    db.viewAsync(_design, _view, {
        'startkey': _startkey,
        'endkey': _endkey
      })
      .then(function(body) {
        body = _.isEmpty(body.rows) ? {} : body;
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
}

exports.bulkUpdate = function(data) {
  // document id and revision _id are required on data
  return new Promise(function(resolve, reject) {
    db.bulkAsync(data)
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      })
  });
};

exports.Search = function(_design, _view, p) {
  return new Promise(function(resolve, reject) {
    var params = new Object();

    params.include_docs = false;
    params.q = p.q;

    if (p.include_docs) {
      params.include_docs = p.include_docs;
    }
    if (p.limit) {
      params.limit = p.limit;
    }
    if (p.sort) {
      params.sort = p.sort;
    }
    db.searchAsync(_design, _view, params)
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

exports.findBySelector = function(data) {
  return new Promise(function(resolve, reject) {
    var selector = {
      'selector': data,
      'fields': [
        '_id',
        'child_team_id',
        'parent_team_id',
        'name',
        'squadteam',
        'doc_status',
      ]
    };
    db.findAsync(selector)
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
};

exports.findRevBySelector = function(id) {
  return new Promise(function(resolve, reject) {
    var data = new Object();
    data['_id'] = id;
    var selector = {
      'selector': data,
      'fields': [
        '_id',
        '_rev'
      ]
    };
    db.findAsync(selector)
      .then(function(body) {
        resolve(body);
      })
      .catch( /* istanbul ignore next */ function(err) {
        reject(err);
      });
  });
}