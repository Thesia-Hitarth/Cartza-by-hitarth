import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';
import axios from 'axios';
import { API_URL } from '../../constants';
import actions from '../../actions';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

class VerifyEmail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
      message: '',
      isResending: false,
      resendMessage: '',
      resendError: ''
    };
  }

  async componentDidMount() {
    const { params } = this.props;
    const token = params.token;

    if (!token) {
      this.setState({ isLoading: false, error: 'No verification token provided.' });
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
      this.setState({
        isLoading: false,
        message: response.data.message || 'Your email has been verified successfully!'
      });
      let loggedIn = false;
      try {
        loggedIn = localStorage.getItem('logged_in') === 'true';
      } catch (e) {
        console.error('localStorage read blocked', e);
      }
      if (loggedIn) {
        this.props.fetchProfile();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Your verification link is invalid or has expired.';
      this.setState({
        isLoading: false,
        error: errorMsg
      });
    }
  }

  handleResend = async () => {
    this.setState({ isResending: true, resendMessage: '', resendError: '' });
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`);
      this.setState({
        isResending: false,
        resendMessage: response.data.message || 'Verification link sent!'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend. Please login again and try.';
      this.setState({
        isResending: false,
        resendError: errorMsg
      });
    }
  };

  render() {
    const { isLoading, error, message, isResending, resendMessage, resendError } = this.state;
    const { authenticated } = this.props;

    if (isLoading) {
      return (
        <div className='verify-email-page d-flex flex-column align-items-center justify-content-center py-5'>
          <LoadingIndicator />
          <p className='mt-3 text-muted'>Verifying your email address...</p>
        </div>
      );
    }

    return (
      <div className='verify-email-page py-5 d-flex justify-content-center'>
        <div className='card p-5 text-center shadow-sm border-0' style={{ maxWidth: '480px', width: '100%' }}>
          {error ? (
            <div>
              <div className='text-danger mb-4' style={{ fontSize: '48px' }}>✕</div>
              <h2 className='mb-3' style={{ fontWeight: '600' }}>Verification Failed</h2>
              <p className='text-muted mb-4'>{error}</p>
              {authenticated && (
                <div className='mb-4'>
                  <button
                    className='btn btn-outline-dark px-4 py-2'
                    disabled={isResending}
                    onClick={this.handleResend}
                  >
                    {isResending ? 'Resending...' : 'Resend Verification Email'}
                  </button>
                  {resendMessage && <p className='text-success mt-2 small'>{resendMessage}</p>}
                  {resendError && <p className='text-danger mt-2 small'>{resendError}</p>}
                </div>
              )}
              <Link to='/login' className='btn btn-dark w-100 py-3 mt-2' style={{ letterSpacing: '0.1em' }}>
                GO TO LOGIN
              </Link>
            </div>
          ) : (
            <div>
              <div className='text-success mb-4' style={{ fontSize: '48px' }}>✓</div>
              <h2 className='mb-3' style={{ fontWeight: '600' }}>Email Verified!</h2>
              <p className='text-muted mb-4'>{message}</p>
              <Link to='/shop' className='btn btn-dark w-100 py-3' style={{ letterSpacing: '0.1em' }}>
                CONTINUE SHOPPING
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    authenticated: state.authentication.authenticated
  };
};

export default withRouter(connect(mapStateToProps, actions)(VerifyEmail));
