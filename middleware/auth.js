_ = require("underscore")
module.exports.requireLogin = function(req, res, next) {
  if(_.isEmpty(req.user))
    res.send(401, {status:401, message: 'Unauthorized'});
  else
    return next();
};
module.exports.requireLoginWithRedirect = function(req, res, next) {
  if (req.path == '/auth')
    return next();
  else if(_.isEmpty(req.user))
    return res.redirect("/login");
  else
    return next();
};
module.exports.requireLoggedOutWithRedirect = function(req, res, next) {
  if(!_.isEmpty(req.user))
    return res.redirect("/");
  else
    return next();
};