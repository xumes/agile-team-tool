const Redux = require('redux');
const Axios = require('axios');
const AxiosMiddleWare = require('redux-axios-middleware').default;
const ReduxDevTools = require('redux-devtools-extension');
const teams = require('./reducers/teams');
const tools = require('./reducers/tools');
const integration = require('./reducers/integration');
const metric = require('./reducers/metric');

const configureStore = function configureStore() {
  const instance = Axios.create({
    baseURL: '/api',
    responseType: 'json',
  });

  const reducers = Redux.combineReducers({
    teams,
    tools,
    integration,
    metric,
  });

  return Redux.createStore(
    reducers,
    ReduxDevTools.composeWithDevTools(
      Redux.applyMiddleware(
        AxiosMiddleWare(instance),
      ),
    ),
  );
};

export default configureStore;
