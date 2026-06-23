/*
 *
 * ResetPassword
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';

import actions from '../../actions';
import ResetPasswordForm from '../../components/Common/ResetPasswordForm';

class ResetPassword extends React.PureComponent {
  handleResetPassword() {
    const token = this.props.match.params.token;
    this.props.resetPassword(token);
  }

  render() {
    const { authenticated, resetFormData, formErrors, resetPasswordChange } =
      this.props;

    if (authenticated) return <Navigate to='/dashboard' replace />;

    return (
      <div className='reset-password-form'>
        <h2>Reset Password</h2>
        <hr />
        <ResetPasswordForm
          isToken
          resetFormData={resetFormData}
          formErrors={formErrors}
          resetPasswordChange={resetPasswordChange}
          resetPassword={() => this.handleResetPassword()}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    authenticated: state.authentication.authenticated,
    resetFormData: state.resetPassword.resetFormData,
    formErrors: state.resetPassword.formErrors
  };
};

export default withRouter(connect(mapStateToProps, actions)(ResetPassword));
