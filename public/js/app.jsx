import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './configure-store';
import HomePage from './components/index/HomePage.jsx';
import './../css/base.scss';

const store  = configureStore();

render(
  <Provider store={store}>
    <HomePage/>
  </Provider>, document.getElementById('app-content')
);
