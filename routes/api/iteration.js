
const loggers = require('../../middleware/logger');
const _ = require('underscore');
const Iterations = require('../../models/iterations');

const formatErrMsg = (msg) => {
  loggers.get('api').error(`Error: ${msg}`);
  return {
    error: msg,
  };
};

module.exports = (app, includes) => {
  /**
   * Get iteration docs by keys(teamId) or get all iteration info docs
   * Cloudant view1: _design/teams/_view/iterinfo?keys=["ag_team_sample_team1_1469007856095"]
   * Cloudant view2: _design/teams/_view/iterinfo
   * @param {String}   teamId(optional)
   */
  const getIterinfo = (req, res) => {
    const teamId = req.params.teamId || undefined;
    loggers.get('api').verbose('[iterationRoute.getIterinfo] teamId:', teamId);
    Iterations.getByIterInfo(teamId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        formatErrMsg(`[iterationRoute.getIterinfo]:${err}`);
        return res.status(400).send(err);
      });
  };

  /**
   * Get single iteration doc by docId
   * @param {String}  docId
   * @return mongodb will return null if no match id
   */
  const getIterationDoc = (req, res) => {
    const docId = req.params.id || undefined;
    loggers.get('api').verbose('[iterationRoute.getIterationDoc] docId:', docId);
    Iterations.get(docId)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        formatErrMsg('[iterationRoute.getIterationDoc]:', JSON.stringify(err));
        return res.status(400).send(err);
      });
  };

  /**
   * Get completed iterations by keys(startkey/endkey)
   * @param {String}  startkey
   * @param {String}  endkey
   */
  const getCompletedIterations = (req, res) => {
    const startkey = req.query.startkey || undefined;
    const endkey = req.query.endkey || undefined;
    loggers.get('api').verbose('[iterationRoute.getCompletedIterations] startkey:%s endkey:%s', startkey, endkey);
    Iterations.getCompletedIterationsByKey(startkey, endkey)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        formatErrMsg(`[getCompletedIterations]:${err}`);
        return res.status(400).send(err);
      });
  };

  /**
   * Add iteration doc
   * @param {String}  request_body
   */
  const createIteration = (req, res) => {
    const data = req.body;
    if (_.isEmpty(data)) {
      return res.status(400).send({
        error: 'Iteration data is missing',
      });
    }
    // loggers.get('api').verbose('[createIteration] POST data:', data);
    // console.log('[createIteration] POST data:', data);
    return Iterations.add(data, req.session.user)
      .then((result) => {
        res.send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        // console.log('[api] [createIteration]:', err);
        loggers.get('api').error('[iterationRoute.createIteration]:', err);
        res.status(400).send(err);
      });
  };

  /**
   * Update iteration doc
   * @param {String}  iteration docId
   * @param {String}  request_body
   */
  const updateIteration = (req, res) => {
    const iterationId = req.params.iterationId;
    const data = req.body;
    if (_.isEmpty(iterationId)) {
      return res.status(400).send({
        error: 'iterationId is missing',
      });
    }
    if (_.isEmpty(data)) {
      return res.status(400).send({
        error: 'Iteration data is missing',
      });
    }
    // loggers.get('api').verbose('[updateIteration] POST data:', JSON.stringify(data, null, 4));
    Iterations.edit(iterationId, data, req.session.user)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        loggers.get('api').error('[iterationRoute.updateIteration]:', err);
        res.status(400).send(err);
      });
    return null;
  };

  /**
   * Search for Iteration docs
   * Accepts querystring parameters such as:
   * @param {String}    id (teamId) (required)
   * @param {String}    status (Y or N) (optional)
   * @param {Date}      startdate (format: YYYYMMDD) (optional)
   * @param {Date}      enddate (format: YYYYMMDD) (optional)
   * @param {Number}    limit (optional)
   */
  const searchTeamIteration = (req, res) => {
    const teamId = req.query.id;
    if (!teamId) { return res.status(400).send({ error: 'TeamId is required' }); }

    const params = {
      id: teamId,
      startDate: req.query.startdate,
      endDate: req.query.enddate,
      limit: req.query.limit,
      status: req.query.status,
    };
    return Iterations.searchTeamIteration(params)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  /**
   * Get all incomplete iteration for update on Sprint availability
   * - teamAvailability
   * - personDaysUnavailable
   * - personDaysAvailable
   */
  const updateSprintAvailability = (req, res) => {
    Iterations.updateSprintAvailability()
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(/* istanbul ignore next */ (err) => {
        /* cannot simulate Mongo error during testing */
        formatErrMsg(`[updateSprintAvailability]:${err}`);
        return res.status(400).send(err);
      });
  };


  app.get('/api/iteration/searchTeamIteration', [includes.middleware.auth.requireLogin], searchTeamIteration);
  app.get('/api/iteration/completed', [includes.middleware.auth.requireLogin], getCompletedIterations);
  app.get('/api/iteration/updateSprintAvailability', [includes.middleware.auth.requireLogin], updateSprintAvailability);
  app.get('/api/iteration/:teamId?', [includes.middleware.auth.requireLogin], getIterinfo);
  app.get('/api/iteration/current/:id', [includes.middleware.auth.requireLogin], getIterationDoc);
  app.post('/api/iteration', [includes.middleware.auth.requireLogin], createIteration);
  app.put('/api/iteration/:iterationId?', [includes.middleware.auth.requireLogin], updateIteration);
};
