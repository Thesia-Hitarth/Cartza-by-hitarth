/*
 *
 * Address
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Routes, Route } from 'react-router-dom';

import actions from '../../actions';

import List from './List';
import Add from './Add';
import Edit from './Edit';
import Page404 from '../../components/Common/Page404';

class Address extends React.PureComponent {
  render() {
    return (
      <div className='address-dashboard'>
        <Routes>
          <Route path='/' element={<List />} />
          <Route path='edit/:id' element={<Edit />} />
          <Route path='add' element={<Add />} />
          <Route path='*' element={<Page404 />} />
        </Routes>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.account.user
  };
};

export default connect(mapStateToProps, actions)(Address);
