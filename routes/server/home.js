
const settings = require('../../settings');

module.exports = (app, includes) => {
  const render = includes.render;
  const json = {
    pageTitle: 'Home',
    googleAnalyticsKey: settings.googleAnalyticsKey,
    ibmNPS: settings.ibmNPS,
    environment: settings.environment,
    sentryPublicDSN: settings.sentry.publicDSN,
    uiReleaseDate: settings.uiReleaseDate,
  };

  app.get(['/', '/home'], includes.middleware.auth.requireLoginWithRedirect, (req, res) => {
    render(req, res, 'app', json);
  });
};
