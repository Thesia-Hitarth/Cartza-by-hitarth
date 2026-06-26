/**
 *
 * AuthSuccess
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';

import actions from '../../actions';
import setToken from '../../utils/token';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

class AuthSuccess extends React.PureComponent {
  componentDidMount() {
    const token = getCookie('token');
    if (token) {
      const jwtToken = decodeURIComponent(token);
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      // Clear the cookie immediately
      document.cookie = 'token=; Max-Age=0; path=/;';
      this.props.setAuth();
    }
  }

  render() {
    const { authenticated } = this.props;

    if (authenticated) return <Navigate to='/dashboard' replace />;

    return <LoadingIndicator />;
  }
}

const mapStateToProps = state => {
  return {
    authenticated: state.authentication.authenticated
  };
};

export default withRouter(connect(mapStateToProps, actions)(AuthSuccess));
