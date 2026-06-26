/**
 *
 * ResetPasswordForm
 *
 */

import React from 'react';

import { Row, Col } from 'reactstrap';

import Input from '../Input';
import Button from '../Button';

const ResetPasswordForm = props => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    resetFormData,
    formErrors,
    isToken,
    resetPasswordChange,
    resetPassword
  } = props;

  const handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='reset-password-form'>
      <form onSubmit={handleSubmit} noValidate>
          {/* ... inputs stay the same ... */}
          {isToken ? (
            <Row>
              <Col xs='12' lg='6'>
                <Input
                  type={'password'}
                  error={formErrors['password']}
                  label={'Password'}
                  name={'password'}
                  placeholder={'Password'}
                  value={resetFormData.password}
                  onInputChange={(name, value) => {
                    resetPasswordChange(name, value);
                  }}
                />
              </Col>
              <Col xs='12' lg='6'>
                <Input
                  type={'password'}
                  error={formErrors['confirmPassword']}
                  label={'Confirm Password'}
                  name={'confirmPassword'}
                  placeholder={'Confirm Password'}
                  value={resetFormData.confirmPassword}
                  onInputChange={(name, value) => {
                    resetPasswordChange(name, value);
                  }}
                />
              </Col>
            </Row>
          ) : (
            <Row>
              <Col xs='12' lg='4'>
                <Input
                  type={'password'}
                  error={formErrors['password']}
                  label={'Old Password'}
                  name={'password'}
                  placeholder={'Old Password'}
                  value={resetFormData.password}
                  onInputChange={(name, value) => {
                    resetPasswordChange(name, value);
                  }}
                />
              </Col>
              <Col xs='12' lg='4'>
                <Input
                  type={'password'}
                  error={formErrors['newPassword']}
                  label={'New Password'}
                  name={'newPassword'}
                  placeholder={'New Password'}
                  value={resetFormData.newPassword || ''}
                  onInputChange={(name, value) => {
                    resetPasswordChange(name, value);
                  }}
                />
              </Col>
              <Col xs='12' lg='4'>
                <Input
                  type={'password'}
                  error={formErrors['confirmPassword']}
                  label={'Confirm New Password'}
                  name={'confirmPassword'}
                  placeholder={'Confirm New Password'}
                  value={resetFormData.confirmPassword}
                  onInputChange={(name, value) => {
                    resetPasswordChange(name, value);
                  }}
                />
              </Col>
            </Row>
          )}
        <hr />
        <div className='reset-actions'>
          <Button type='submit' text='Reset Password' loading={isSubmitting} />
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
