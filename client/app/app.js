/**
 *
 * app.js
 *
 */

import React from 'react';
import { Provider } from 'react-redux';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
import { HelmetProvider } from 'react-helmet-async';

import store, { history } from './store';
import Application from './containers/Application';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ScrollToTop from './scrollToTop';
import axios from 'axios';
import * as Sentry from '@sentry/react';
import { signOut } from './containers/Login/actions';


// Global Axios response interceptor to catch 401s and sign out the user
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        store.dispatch(signOut());
      } else if (error.response.status >= 500) {
        Sentry.captureException(new Error(`API Error ${error.response.status}: ${error.config?.url || 'Unknown'}`), {
          extra: {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
            method: error.config?.method
          }
        });
      }
    } else {
      Sentry.captureException(new Error(`API Network Failure: ${error.config?.url || 'Unknown URL'}`), {
        extra: {
          error: error.message,
          config: error.config
        }
      });
    }
    return Promise.reject(error);
  }
);

// Import application sass styles
import './styles/style.scss';

// rc-slider style
import 'rc-slider/assets/index.css';


const app = () => (
  <HelmetProvider>
    <Provider store={store}>
      <ReduxRouter history={history}>
        <ScrollToTop>
          <ErrorBoundary>
            <Application />
          </ErrorBoundary>
        </ScrollToTop>
      </ReduxRouter>
    </Provider>
  </HelmetProvider>
);

export default app;
