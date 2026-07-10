/*
 *
 * Admin
 *
 */

import React from 'react';

import { Routes, Route } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import AccountMenu from '../../Account/AccountMenu';
import Page404 from '../../Common/Page404';

import Account from '../../../containers/Account';
import AccountSecurity from '../../../containers/AccountSecurity';
import Order from '../../../containers/Order';
import Users from '../../../containers/Admin/Users';
import Category from '../../../containers/Admin/Category';
import Product from '../../../containers/Admin/Product';
import Brand from '../../../containers/Admin/Brand';
import Merchant from '../../../containers/Admin/Merchant';
import Review from '../../../containers/Admin/Review';
import Inquiries from '../../../containers/Admin/Inquiries';

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
