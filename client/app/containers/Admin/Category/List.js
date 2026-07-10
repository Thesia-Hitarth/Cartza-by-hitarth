/*
 *
 * List
 *
 */

import React from 'react';

import { connect } from 'react-redux';

import actions from '../../../actions';
import { withRouter } from '../../../utils/withRouter';

import CategoryList from '../../../components/Admin/CategoryList';
import SubPage from '../../../components/Admin/SubPage';
import LoadingIndicator from '../../../components/Common/LoadingIndicator';
import NotFound from '../../../components/Common/NotFound';

class List extends React.PureComponent {
  componentDidMount() {
    this.props.fetchCategories();
  }

  render() {
    const { history, categories, isLoading } = this.props;

    return (
      <>
        <SubPage
          title='Categories'
          actionTitle='Add'
          handleAction={() => history.push('/dashboard/category/add')}
        >
          {isLoading ? (
            <LoadingIndicator inline />
          ) : categories.length > 0 ? (
            <CategoryList categories={categories} />
          ) : (
            <NotFound message='No categories found.' />
          )}
        </SubPage>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    categories: state.category.categories,
    isLoading: state.category.isLoading,
    user: state.account.user
  };
};

export default withRouter(connect(mapStateToProps, actions)(List));
