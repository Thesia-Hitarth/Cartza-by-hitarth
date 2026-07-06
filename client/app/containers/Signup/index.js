/**
 *
 * Signup
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { Navigate, Link } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';

import actions from '../../actions';
import Input from '../../components/Common/Input';
import Checkbox from '../../components/Common/Checkbox';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import SignupProvider from '../../components/Common/SignupProvider';
import Button from '../../components/Common/Button';

class Signup extends React.PureComponent {
  componentDidMount() {
    document.title = 'Sign Up | CARTZA';
  }

  render() {
    const {
      authenticated,
      signupFormData,
      formErrors,
      isLoading,
      isSubmitting,
      isSubscribed,
      signupChange,
      signUp,
      subscribeChange
    } = this.props;

    if (authenticated) return <Navigate to='/dashboard' replace />;

    const handleSubmit = event => {
      event.preventDefault();
      signUp();
    };

    return (
      <div className='auth-page-redesign signup-page-layout'>
        {isLoading && <LoadingIndicator />}

        <div className='auth-split-container shadow-lg'>
          <Row className='no-gutters h-100'>
            {/* Left 55% Column: Brand Statement Image */}
            <Col xs='12' md='6' lg='7' className='auth-left-banner d-none d-md-block'>
              <div className='banner-image-overlay'></div>
              <div className='banner-quote-box text-center px-5'>
                <h2 className='quote-title mb-3'>CARTZA</h2>
                <p className='quote-text'>
                  &ldquo;<i>Fashion changes, but style endures.</i>&rdquo;
                </p>
                <div className='quote-divider mx-auto'></div>
                <span className='quote-sub'>Est. 2024</span>
              </div>
            </Col>

            {/* Right 45% Column: Form Panel */}
            <Col xs='12' md='6' lg='5' className='auth-right-form p-4 p-lg-5'>
              <div className='form-panel-header mb-4 text-center text-md-left'>
                <h3 className='form-title mb-2'>Create Account</h3>
                <p className='form-subtitle'>Join Cartza to explore premium fashion and electronics</p>
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
                <div className={`auth-input-group ${formErrors['email'] ? 'has-error' : signupFormData.email ? 'has-success' : ''}`}>
                  <Input
                    type={'email'}
                    error={formErrors['email']}
                    label={'Email Address'}
                    name={'email'}
                    placeholder={'Enter your email'}
                    value={signupFormData.email}
                    onInputChange={(name, value) => {
                      signupChange(name, value);
                    }}
                  />
                  {signupFormData.email && !formErrors['email'] && (
                    <span className='inline-validation-icon text-success'>✓</span>
                  )}
                  {formErrors['email'] && (
                    <span className='inline-validation-icon text-danger'>✕</span>
                  )}
                </div>

                <Row>
                  <Col xs='6'>
                    {/* First Name Input */}
                    <div className={`auth-input-group ${formErrors['firstName'] ? 'has-error' : signupFormData.firstName ? 'has-success' : ''}`}>
                      <Input
                        type={'text'}
                        error={formErrors['firstName']}
                        label={'First Name'}
                        name={'firstName'}
                        placeholder={'First name'}
                        value={signupFormData.firstName}
                        onInputChange={(name, value) => {
                          signupChange(name, value);
                        }}
                      />
                    </div>
                  </Col>
                  <Col xs='6'>
                    {/* Last Name Input */}
                    <div className={`auth-input-group ${formErrors['lastName'] ? 'has-error' : signupFormData.lastName ? 'has-success' : ''}`}>
                      <Input
                        type={'text'}
                        error={formErrors['lastName']}
                        label={'Last Name'}
                        name={'lastName'}
                        placeholder={'Last name'}
                        value={signupFormData.lastName}
                        onInputChange={(name, value) => {
                          signupChange(name, value);
                        }}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Password Input */}
                <div className={`auth-input-group ${formErrors['password'] ? 'has-error' : signupFormData.password ? 'has-success' : ''}`}>
                  <Input
                    type={'password'}
                    label={'Password'}
                    error={formErrors['password']}
                    name={'password'}
                    placeholder={'Create a password'}
                    value={signupFormData.password}
                    onInputChange={(name, value) => {
                      signupChange(name, value);
                    }}
                  />
                  {signupFormData.password && !formErrors['password'] && (
                    <span className='inline-validation-icon text-success'>✓</span>
                  )}
                  {formErrors['password'] && (
                    <span className='inline-validation-icon text-danger'>✕</span>
                  )}
                </div>

                {/* Subscribe Checkbox */}
                <div className='subscribe-checkbox-wrapper my-3'>
                  <Checkbox
                    id={'subscribe'}
                    label={'Subscribe to newsletter'}
                    checked={isSubscribed}
                    onChange={subscribeChange}
                  />
                </div>

                <div className='auth-action-btn-row d-flex flex-column gap-3 mt-4'>
                  <Button
                    type='submit'
                    variant='primary'
                    text='Sign Up'
                    className='btn-auth-submit'
                    loading={isSubmitting}
                  />
                  
                  <Link
                    className='btn-auth-toggle text-center d-block'
                    to='/login'
                  >
                    Already have an account? Login
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
    signupFormData: state.signup.signupFormData,
    formErrors: state.signup.formErrors,
    isLoading: state.signup.isLoading,
    isSubmitting: state.signup.isSubmitting,
    isSubscribed: state.signup.isSubscribed
  };
};

export default withRouter(connect(mapStateToProps, actions)(Signup));
