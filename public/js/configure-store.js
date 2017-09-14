import { createStore, combineReducers, applyMiddleware } from 'redux';
import axios from 'axios';
import axiosMiddleWare from 'redux-axios-middleware';
import teams from './reducers/teams';

export default function configureStore() {
  const instance = axios.create({
    baseURL: '/api',
    responseType: 'json',
  });

  const reducers = combineReducers({
    teams,
  });

  return createStore(
    reducers,
    applyMiddleware(
      axiosMiddleWare(instance),
    ),
  );
}
