/**
 *
 * Login
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { withRouter } from '../../utils/withRouter';

import actions from '../../actions';
import Input from '../../components/Common/Input';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import SignupProvider from '../../components/Common/SignupProvider';

class Login extends React.PureComponent {
  componentDidMount() {
    document.title = 'Login | CARTZA';
  }

  render() {
    const {
      authenticated,
      loginFormData,
      loginChange,
      login,
      formErrors,
      isLoading,
      isSubmitting
    } = this.props;

    if (authenticated) return <Navigate to='/dashboard' replace />;

    const registerLink = () => {
      this.props.history.push('/register');
    };

    const handleSubmit = event => {
      event.preventDefault();
      login();
    };

    return (
      <div className='auth-page-redesign login-page-layout'>
        {isLoading && <LoadingIndicator />}
        
        <div className='auth-split-container shadow-lg'>
          <Row className='no-gutters h-100'>
            {/* Left 55% Column: Brand Statement Image */}
            <Col xs='12' md='6' lg='7' className='auth-left-banner d-none d-md-block'>
              <div className='banner-image-overlay'></div>
              <div className='banner-quote-box text-center px-5'>
                <h2 className='quote-title mb-3'>CARTZA</h2>
                <p className='quote-text'>
                  "<i>Style is a way to say who you are without having to speak.</i>"
                </p>
                <div className='quote-divider mx-auto'></div>
                <span className='quote-sub'>Est. 2024</span>
              </div>
            </Col>

            {/* Right 45% Column: Form Panel */}
            <Col xs='12' md='6' lg='5' className='auth-right-form p-4 p-lg-5'>
              <div className='form-panel-header mb-4 text-center text-md-left'>
                <h3 className='form-title mb-2'>Welcome Back</h3>
                <p className='form-subtitle'>Login to manage your account and orders</p>
              </div>

              {/* OAuth buttons */}
              <div className='oauth-wrapper mb-4'>
                <SignupProvider />
              </div>

              <div className='form-divider mb-4'>
                <span className='divider-text'>or continue with email</span>
              </div>

              <form onSubmit={handleSubmit} noValidate className='auth-form-fields'>
                {/* Email Input */}
                <div className={`auth-input-group ${formErrors['email'] ? 'has-error' : loginFormData.email ? 'has-success' : ''}`}>
                  <Input
                    type={'email'}
                    error={formErrors['email']}
                    label={'Email Address'}
                    name={'email'}
                    placeholder={'Enter your email'}
                    value={loginFormData.email}
                    onInputChange={(name, value) => {
                      loginChange(name, value);
                    }}
                  />
                  {/* Inline visual validation icon feedback */}
                  {loginFormData.email && !formErrors['email'] && (
                    <span className='inline-validation-icon text-success'>✓</span>
                  )}
                  {formErrors['email'] && (
                    <span className='inline-validation-icon text-danger'>✕</span>
                  )}
                </div>

                {/* Password Input */}
                <div className={`auth-input-group ${formErrors['password'] ? 'has-error' : loginFormData.password ? 'has-success' : ''}`}>
                  <Input
                    type={'password'}
                    error={formErrors['password']}
                    label={'Password'}
                    name={'password'}
                    placeholder={'Enter your password'}
                    value={loginFormData.password}
                    onInputChange={(name, value) => {
                      loginChange(name, value);
                    }}
                  />
                  {loginFormData.password && !formErrors['password'] && (
                    <span className='inline-validation-icon text-success'>✓</span>
                  )}
                  {formErrors['password'] && (
                    <span className='inline-validation-icon text-danger'>✕</span>
                  )}
                </div>

                {/* Form Actions Footer */}
                <div className='d-flex align-items-center justify-content-between mt-4 mb-3'>
                  <Link
                    className='redirect-link forgot-password-link'
                    to={'/forgot-password'}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className='auth-action-btn-row d-flex flex-column gap-3 mt-4'>
                  <button
                    type='submit'
                    className='btn-auth-submit'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                  
                  <Link
                    className='btn-auth-toggle text-center d-block'
                    to='/register'
                  >
                    Create an Account
                  </Link>
                </div>
              </form>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    authenticated: state.authentication.authenticated,
    loginFormData: state.login.loginFormData,
    formErrors: state.login.formErrors,
    isLoading: state.login.isLoading,
    isSubmitting: state.login.isSubmitting
  };
};

export default withRouter(connect(mapStateToProps, actions)(Login));
