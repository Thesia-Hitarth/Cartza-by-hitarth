/*
 *
 * Admin
 *
 */

import React from 'react';

import { Routes, Route } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import AccountMenu from '../AccountMenu';
import Page404 from '../../Common/Page404';

import Account from '../../../containers/Account';
import AccountSecurity from '../../../containers/AccountSecurity';
import Order from '../../../containers/Order';
import Users from '../../../containers/Users';
import Category from '../../../containers/Category';
import Product from '../../../containers/Product';
import Brand from '../../../containers/Brand';
import Merchant from '../../../containers/Merchant';
import Review from '../../../containers/Review';
import Inquiries from '../../../containers/Inquiries';

const Admin = props => {
  return (
    <div className='admin'>
      <Row>
        <Col xs='12' md='5' xl='3'>
          <AccountMenu {...props} />
        </Col>
        <Col xs='12' md='7' xl='9'>
          <div className='panel-body'>
            <Routes>
              <Route path='/' element={<Account />} />
              <Route path='security' element={<AccountSecurity />} />
              <Route path='product/*' element={<Product />} />
              <Route path='category/*' element={<Category />} />
              <Route path='brand/*' element={<Brand />} />
              <Route path='users' element={<Users />} />
              <Route path='merchant/*' element={<Merchant />} />
              <Route path='orders/*' element={<Order />} />
              <Route path='review' element={<Review />} />
              <Route path='inquiries' element={<Inquiries />} />
              <Route path='*' element={<Page404 />} />
            </Routes>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;
