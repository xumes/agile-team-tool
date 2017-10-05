import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './configure-store';
import i18n from './i18n/i18n.js';
import HomePage from './components/index/HomePage.jsx';
import './../css/base.scss';


const store = configureStore();

i18n
  .initialize()
    .then((response) => {})
    .catch((er) => {})
    // always render!
    .then(() => {
      render(
        <Provider store={store}>
          <HomePage/>
        </Provider>, document.getElementById('app-content')
      );
    });
