var settings = require('../../settings');

module.exports = function(app, includes) {

  app.post('/auth', includes.passport.authenticate('ldap-login', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  app.get('/logout', function(req, res){
  	delete req.session.userid;
	delete req.session.userinfo;
	req.logout();
	return res.redirect("/login");
  });
};