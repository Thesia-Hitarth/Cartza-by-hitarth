/*
 *
 * Add
 *
 */

import React from 'react';

import { connect } from 'react-redux';

import actions from '../../actions';
import { withRouter } from '../../utils/withRouter';

import AddAddress from '../../components/Manager/AddAddress';
import SubPage from '../../components/Manager/SubPage';

class Add extends React.PureComponent {
  render() {
    const {
      history,
      addressFormData,
      formErrors,
      addressChange,
      addAddress
    } = this.props;

    return (
      <SubPage
        title='Add Address'
        actionTitle='Cancel'
        handleAction={() => history.goBack()}
      >
        <AddAddress
          addressFormData={addressFormData}
          formErrors={formErrors}
          addressChange={addressChange}
          addAddress={addAddress}
        />
      </SubPage>
    );
  }
}

const mapStateToProps = state => {
  return {
    addressFormData: state.address.addressFormData,
    formErrors: state.address.formErrors
  };
};

export default withRouter(connect(mapStateToProps, actions)(Add));
