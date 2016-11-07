var apiKeyModel = require('../../models/mongodb/apiKeys');

_ = require('underscore');

var auth = {
  requireLogin: function(req, res, next) {
    if (_.isEmpty(req.user))
      res.send(401, {
        status: 401,
        message: 'Unauthorized'
      });
    else
      return next();
  },

  requireLoginWithRedirect: function(req, res, next) {
    //console.log("req.path=", req.path);
    if (req.path == '/auth' || req.path == '/auth/saml/ibm/callback')
      return next();
    else if (_.isEmpty(req.user))
      return res.redirect('/login');
    else
      return next();
  },

  requireLoggedOutWithRedirect: function(req, res, next) {
    if (!_.isEmpty(req.user))
      return res.redirect('/');
    else
      return next();
  },

  requireAdmin: function(req, res, next) {
    //TODO
    // if(_.isEmpty(req.user))
    //   res.send(401, {status:401, message: 'Unauthorized'});
    // else
    //   return next();
  },

  requireAdminOrSupport: function(req, res, next) {
    //TODO
    // if(_.isEmpty(req.user))
    //   res.send(401, {status:401, message: 'Unauthorized'});
    // else
    //   return next();
  },

  requireApikey: function(req, res, next) {
    if (_.isEmpty(req.headers.apikey)) {
      res.status(401).send({
        status: 401,
        message: 'Unauthorized'
      });
    } else {
//      userModel.getUserApikeyByApikey(req.headers.apikey)
      console.log('Ready to call API key by API ');
      apiKeyModel.getUserApikeyByApikey(req.headers.apikey)
      .then(function(apiuser) {
        if (_.isEmpty(apiuser)) {
          res.status(401).send({
            status: 401,
            message: 'Unauthorized'
          });
          return null;
        } else {
          console.log('API user object return from apiKeyModel '+apiuser.userId+' email is '+apiuser.email);
          apiuser = {userId: apiuser.userId, email: apiuser.email};
          req.apiuser = apiuser;
          return next();
        }
      })
      .catch(function(err) {
        console.log(err);
        res.status(err.statusCode).send(err.message);
        return null;
      });
    }
  }
};

module.exports = auth;
