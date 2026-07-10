/**
 *
 * AuthSuccess
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';

import axios from 'axios';
import { API_URL } from '../../constants';
import actions from '../../actions';
import setToken from '../../utils/token';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import { setStorageItem } from '../../utils/storage';

class AuthSuccess extends React.PureComponent {
  async componentDidMount() {
    try {
      const response = await axios.get(`${API_URL}/auth/google/success`, {
        withCredentials: true
      });
      if (response.data.success) {
        try {
          setStorageItem('logged_in', 'true');
        } catch (e) {
          console.error('localStorage write blocked', e);
        }
        this.props.setAuth();
      } else {
        this.props.history.replace('/login');
      }
    } catch (error) {
      console.error('Google login verification failed:', error);
      this.props.history.replace('/login');
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
