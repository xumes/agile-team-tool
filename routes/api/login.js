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
    //if (req.headers['test-api-key'] == "test-secrect") {
      //console.log("pass test");
      //req.session['email'] = "winnuser@us.ibm.com";
      var user = {
          'shortEmail': req.params.user,
          'ldap':
            {
              'serialNumber': '123456PH1',
              'hrFirstName': 'John',
              'hrLastName': 'Doe'
            }
      };
      req.session.user = user;
      console.log(req.session.user);

      //req.session['user'] = user;
      req.login(user, function(err) {
        if (err) {
          res.send(err);
        } else {
          res.status(200).send('Successfully authenticated test user');
        }
      });
    //} else {
      //res.status(401).send('Invalid user');
    //}
  });
};
