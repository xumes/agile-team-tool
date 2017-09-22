const Redux = require('redux');
const Axios = require('axios');
const AxiosMiddleWare = require('redux-axios-middleware').default;
const ReduxDevTools = require('redux-devtools-extension');

const projects = require('./modules/projects').reducer;
const team = require('./modules/team').reducer;
const tools = require('./modules/tools').reducer;

const configureStore = function configureStore() {
  const instance = Axios.create({
    baseURL: '/api',
    responseType: 'json',
  });

  const reducers = Redux.combineReducers({
    projects,
    team,
    tools,
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
