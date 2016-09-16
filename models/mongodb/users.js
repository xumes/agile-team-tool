var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Just needed so that corresponding test could run
require('../../settings');

module.exports.UserSchema = new Schema({
  userId: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String
  },
  adminAccess: {
    type: String,
    default: 'none'
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

var User = mongoose.model('User', exports.UserSchema);

module.exports.findUserByEmail = function(email) {
  return User.findOne({email: email});
};


