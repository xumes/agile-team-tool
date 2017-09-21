const Redux = require('redux');
const Axios = require('axios');
const AxiosMiddleWare = require('redux-axios-middleware').default;
const ReduxDevTools = require('redux-devtools-extension');

const tools = require('./modules/tools').reducer;
const team = require('./modules/team').reducer;
const project = require('./modules/project').reducer;

const configureStore = function configureStore() {
  const instance = Axios.create({
    baseURL: '/api',
    responseType: 'json',
  });

  const reducers = Redux.combineReducers({
    tools,
    team,
    project,
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
