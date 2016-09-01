var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessment = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Maturity Assessment',
        'prefix'          : settings.prefixes.assessment
      };
    render(req, res, 'assessment', json);
  };
  
  app.get('/assessment', includes.middleware.auth.requireLoginWithRedirect, showAssessment);
};