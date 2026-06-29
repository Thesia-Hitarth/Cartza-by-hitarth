/**
 *
 * app.js
 *
 */

import React from 'react';
import { Provider } from 'react-redux';
import { ReduxRouter } from '@lagunovsky/redux-react-router';

import store, { history } from './store';
import { SET_AUTH } from './containers/Authentication/constants';
import Application from './containers/Application';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ScrollToTop from './scrollToTop';
import setToken from './utils/token';
import axios from 'axios';
import { signOut } from './containers/Login/actions';


// Global Axios response interceptor to catch 401s and sign out the user
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      store.dispatch(signOut());
    }
    return Promise.reject(error);
  }
);

// Import application sass styles
import './styles/style.scss';

// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';

// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';

// react-bootstrap-table2 styles
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

// rc-slider style
import 'rc-slider/assets/index.css';

// Authentication
const loggedIn = localStorage.getItem('logged_in') === 'true';

if (loggedIn) {
  // authenticate routes
  store.dispatch({ type: SET_AUTH });
}

const app = () => (
  <Provider store={store}>
    <ReduxRouter history={history}>
      <ScrollToTop>
        <ErrorBoundary>
          <Application />
        </ErrorBoundary>
      </ScrollToTop>
    </ReduxRouter>
  </Provider>
);

export default app;
