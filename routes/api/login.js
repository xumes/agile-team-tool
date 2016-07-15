var settings = require('../../settings');

module.exports = function(app, includes) {

  app.post('/auth', includes.passport.authenticate('ldap-login', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  app.get('/logout', function(req, res){
    req.session.destroy(function (err) {
      res.redirect('/login');
    });
  });
};