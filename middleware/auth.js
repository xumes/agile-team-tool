_ = require("underscore")
module.exports.requireLogin = function(req, res, next) {
  if(_.isEmpty(req.user))
    return res.redirect("/login");
  else
    return next();
};