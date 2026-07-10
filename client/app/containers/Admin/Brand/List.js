/*
 *
 * List
 *
 */

import React from 'react';

import { connect } from 'react-redux';

import actions from '../../../actions';
import { ROLES } from '../../../constants';
import { withRouter } from '../../../utils/withRouter';

import BrandList from '../../../components/Admin/BrandList';
import SubPage from '../../../components/Admin/SubPage';
import LoadingIndicator from '../../../components/Common/LoadingIndicator';
import NotFound from '../../../components/Common/NotFound';

class List extends React.PureComponent {
  componentDidMount() {
    this.props.fetchBrands();
  }

  render() {
    const { history, brands, isLoading, user } = this.props;

    return (
      <>
        <SubPage
          title={user.role === ROLES.Admin ? 'Brands' : 'Brand'}
          actionTitle={user.role === ROLES.Admin && 'Add'}
          handleAction={() => history.push('/dashboard/brand/add')}
        >
          {isLoading ? (
            <LoadingIndicator inline />
          ) : brands.length > 0 ? (
            <BrandList brands={brands} user={user} />
          ) : (
            <NotFound message='No brands found.' />
          )}
        </SubPage>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    brands: state.brand.brands,
    isLoading: state.brand.isLoading,
    user: state.account.user
  };
};

export default withRouter(connect(mapStateToProps, actions)(List));
