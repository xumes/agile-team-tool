var settings = require('../../settings');

module.exports = function(app, includes) {

  app.post('/auth', includes.passport.authenticate('ldap-login', {
    successRedirect: '/',
    failureRedirect: '/login'
  }))

};