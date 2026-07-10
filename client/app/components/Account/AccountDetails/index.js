/**
 *
 * AccountDetails
 *
 */

import React from 'react';
import { Row, Col } from 'reactstrap';

import { EMAIL_PROVIDER } from '../../../constants';
import UserRole from '../../Admin/UserRole';
import Input from '../../Common/Input';
import Button from '../../Common/Button';

const AccountDetails = props => {
  const { user, accountChange, updateProfile } = props;

  const handleSubmit = event => {
    event.preventDefault();
    updateProfile();
  };

  return (
    <div className='account-details-redesign'>
      <div className='account-details-form-box p-4 shadow-sm' data-animate="fade-up">
        <div className='info-panel-header mb-4 d-flex align-items-center justify-content-between pb-3'>
          <div className='user-identity'>
            <span className='email-label d-block'>Logged In Email</span>
            <p className='user-email font-weight-600 mb-0'>
              {user.provider === EMAIL_PROVIDER.Email ? (
                user.email
              ) : (
                <span className='provider-email'>
                  Logged in With {user.provider}
                </span>
              )}
            </p>
          </div>
          <UserRole user={user} />
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <Row>
            <Col xs='12' md='6' className="mb-3">
              <Input
                type={'text'}
                label={'First Name'}
                name={'firstName'}
                placeholder={'First Name'}
                value={user.firstName ? user.firstName : ''}
                onInputChange={(name, value) => {
                  accountChange(name, value);
                }}
              />
            </Col>
            <Col xs='12' md='6' className="mb-3">
              <Input
                type={'text'}
                label={'Last Name'}
                name={'lastName'}
                placeholder={'Last Name'}
                value={user.lastName ? user.lastName : ''}
                onInputChange={(name, value) => {
                  accountChange(name, value);
                }}
              />
            </Col>
            <Col xs='12' md='12' className="mb-3">
              <Input
                type={'text'}
                label={'Phone Number'}
                name={'phoneNumber'}
                placeholder={'Phone Number'}
                value={user.phoneNumber ? user.phoneNumber : ''}
                onInputChange={(name, value) => {
                  accountChange(name, value);
                }}
              />
            </Col>
          </Row>
          <div className='profile-actions-bar border-top pt-4 mt-3 d-flex justify-content-end'>
            <button type='submit' className='btn-dashboard-save'>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountDetails;
