var settings = require('../../settings');
 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessmentProgress = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Maturity Assessment',
        'prefix'          : settings.prefixes.assessment
      };
      render(req, res, 'progress', json);
  };
  
  app.get('/progress', includes.middleware.auth.requireLoginWithRedirect, showAssessmentProgress);
};