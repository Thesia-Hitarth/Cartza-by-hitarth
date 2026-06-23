/**
 *
 * Authentication
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';

import actions from '../../actions';

export default function (ComposedComponent) {
  class Authentication extends React.PureComponent {
    render() {
      const { authenticated } = this.props;

      if (!authenticated) {
        return <Navigate to='/login' replace />;
      } else {
        return <ComposedComponent {...this.props} />;
      }
    }
  }

  const mapStateToProps = state => {
    return {
      authenticated: state.authentication.authenticated
    };
  };

  return connect(mapStateToProps, actions)(Authentication);
}
