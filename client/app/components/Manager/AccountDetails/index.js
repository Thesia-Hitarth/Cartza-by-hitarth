/**
 *
 * AccountDetails
 *
 */

import React from 'react';
import { Row, Col } from 'reactstrap';

import { EMAIL_PROVIDER } from '../../../constants';
import UserRole from '../UserRole';
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
      {/* Redesigned 4-column Stats grid */}
      <Row className='mb-5 stats-cards-grid' data-animate="fade-up">
        <Col xs='12' sm='6' lg='3' className='mb-3 mb-lg-0'>
          <div className='stats-card p-4 shadow-sm' style={{ '--card-idx': 1 }}>
            <span className='stats-label d-block mb-1'>Total Revenue</span>
            <div className='d-flex align-items-center justify-content-between'>
              <span className='stats-number'>₹2,48,500</span>
              <span className='stats-trend up'>▲ 12.5%</span>
            </div>
          </div>
        </Col>
        <Col xs='12' sm='6' lg='3' className='mb-3 mb-lg-0'>
          <div className='stats-card p-4 shadow-sm' style={{ '--card-idx': 2 }}>
            <span className='stats-label d-block mb-1'>Total Orders</span>
            <div className='d-flex align-items-center justify-content-between'>
              <span className='stats-number'>1,248</span>
              <span className='stats-trend up'>▲ 8.3%</span>
            </div>
          </div>
        </Col>
        <Col xs='12' sm='6' lg='3' className='mb-3 mb-lg-0'>
          <div className='stats-card p-4 shadow-sm' style={{ '--card-idx': 3 }}>
            <span className='stats-label d-block mb-1'>Average Order</span>
            <div className='d-flex align-items-center justify-content-between'>
              <span className='stats-number'>₹1,990</span>
              <span className='stats-trend down'>▼ 1.2%</span>
            </div>
          </div>
        </Col>
        <Col xs='12' sm='6' lg='3'>
          <div className='stats-card p-4 shadow-sm' style={{ '--card-idx': 4 }}>
            <span className='stats-label d-block mb-1'>Active Customers</span>
            <div className='d-flex align-items-center justify-content-between'>
              <span className='stats-number'>482</span>
              <span className='stats-trend up'>▲ 5.4%</span>
            </div>
          </div>
        </Col>
      </Row>

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
