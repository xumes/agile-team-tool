const settings = require('../../settings');

module.exports = (app, includes) => {
  app.post('/auth', includes.passport.authenticate('ldap-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    successReturnToOrRedirect: true,
  }));

  app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      if (settings.authType === 'saml') {
        res.redirect('https://w3id.sso.ibm.com/pkmslogout');
      } else {
        res.redirect('/login');
      }
    });
  });

  // test login function
  app.get('/api/login/masquerade/:user', (req, res) => {
    const user = {
      shortEmail: req.params.user,
      ldap: {
        serialNumber: '123456PH1',
        uid: '123456PH1',
        hrFirstName: 'John',
        hrLastName: 'Doe',
      },
    };
    req.login(user, (err) => {
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
