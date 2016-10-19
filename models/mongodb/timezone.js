var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var userModel = require('./users.js');
var moment = require('moment');
var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var settings = require('../../settings');
var Schema = mongoose.Schema;

var timezoneSechma = {
  locationName: {
    type: String,
    unique: true,
    required: [true, 'location is required']
  },
  locationId: {
    type: String,
    unique: true,
    required: [true, 'location is required']
  },
  timezone: {
    type: Number,
    required: [true, 'timezone is required'],
    max: 14,
    min: -12
  },
  lastUpdate: {
    type: Date,
    default: moment(new Date()).format(dateFormat)
  }
};

var Timezone = mongoose.model('timezone', timezoneSechma);

timezoneSechma.path('locationId').validate(function(value, done) {
  this.model('timezone').count({locationId: value}, function(err, count) {
    if (err) return done(err);
    done(!count);
  });
}, 'This location already exists.');

var createLocationId = function(locationName) {
  return locationName.toLowerCase().replace(/[^a-z1-9]/g, '');
};

var getAllUniqueLocations = function() {
  userModel.getUserByUserEmail()
    .then(function(users){
    })
    .catch(function(err){
    });
};
