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

  // test login function
  app.get('/api/login/masquerade/:user', function(req, res) {
    var user = {
      'shortEmail': req.params.user,
      'ldap':
        {
          'serialNumber': '123456PH1',
          'hrFirstName': 'John',
          'hrLastName': 'Doe'
        }
    };
    req.login(user, function(err) {
      /* istanbul ignore if  */
      if (err) {
        res.send(err);
      } else {
        req.session.user = user;
        res.status(200).send('Successfully authenticated test user');
      }
    });
  });
};
