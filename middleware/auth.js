module.exports.requireLogin = function(req, res, next) {

  if (!req.session.userid) {
    
    req.session.afterLogin = req.url;
    req.session.path = req.url;
    return res.redirect("/login");

  } else {
    if (req.user) 
      return next();
  }
};