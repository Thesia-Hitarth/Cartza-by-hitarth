/*
 *
 * List
 *
 */

import React from 'react';

import { connect } from 'react-redux';

import actions from '../../../actions';
import { withRouter } from '../../../utils/withRouter';

import ProductList from '../../../components/Admin/ProductList';
import SubPage from '../../../components/Admin/SubPage';
import LoadingIndicator from '../../../components/Common/LoadingIndicator';
import NotFound from '../../../components/Common/NotFound';
import Pagination from '../../../components/Common/Pagination';

class List extends React.PureComponent {
  componentDidMount() {
    this.props.fetchProducts();
  }

  render() {
    const { history, products, isLoading, advancedFilters } = this.props;
    const { totalPages } = advancedFilters;
    const displayPagination = totalPages > 1;

    return (
      <>
        <SubPage
          title='Products'
          actionTitle='Add'
          handleAction={() => history.push('/dashboard/product/add')}
        >
          {isLoading ? (
            <LoadingIndicator inline />
          ) : products.length > 0 ? (
            <>
              <ProductList products={products} />
              {displayPagination && (
                <div className='d-flex justify-content-center text-center mt-4'>
                  <Pagination
                    totalPages={totalPages}
                    onPagination={(name, page) => this.props.fetchProducts(page)}
                  />
                </div>
              )}
            </>
          ) : (
            <NotFound message='No products found.' />
          )}
        </SubPage>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    products: state.product.products,
    isLoading: state.product.isLoading,
    user: state.account.user,
    advancedFilters: state.product.advancedFilters
  };
};

export default withRouter(connect(mapStateToProps, actions)(List));
